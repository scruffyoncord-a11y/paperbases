"""
server.py — Python backend for Exam Portal
Routes:
  GET  /                → serves index.html (static files)
  POST /api/upload-pdf  → accepts PDF, sends to PaddleOCR API, returns parsed JSON
  GET  /api/status/:id  → polls PaddleOCR job status
  GET  /imgs/*           → serves downloaded images
"""

import json
import os
import time
import uuid
import requests as http_requests
from requests.exceptions import ProxyError, ConnectionError, Timeout
from flask import Flask, request, jsonify, send_from_directory
from threading import Thread

app = Flask(__name__, static_folder='.', static_url_path='')

# ---- PaddleOCR API Config ----
JOB_URL = "https://paddleocr.aistudio-app.com/api/v2/ocr/jobs"
TOKEN = "101b45aead046b960dfc4e4e83191812bccb7296"
MODEL = "PaddleOCR-VL-1.5"
REQUEST_TIMEOUT = 45
USE_SYSTEM_PROXY = os.getenv("PAPERBASE_USE_SYSTEM_PROXY", "").lower() in {"1", "true", "yes", "on"}

OPTIONAL_PAYLOAD = {
    "markdownIgnoreLabels": [
        "header", "header_image", "footer", "footer_image",
        "number", "footnote", "aside_text"
    ],
    "useDocOrientationClassify": False,
    "useDocUnwarping": False,
    "useLayoutDetection": True,
    "useChartRecognition": False,
    "useSealRecognition": True,
    "useOcrForImageBlock": False,
    "mergeTables": True,
    "relevelTitles": True,
    "layoutShapeMode": "auto",
    "promptLabel": "ocr",
    "repetitionPenalty": 1,
    "temperature": 0,
    "topP": 1,
    "minPixels": 147384,
    "maxPixels": 2822400,
    "layoutNms": True,
    "restructurePages": True
}

# In-memory job tracker
jobs = {}  # local_id -> { status, paddleJobId, result, error, progress }

if not USE_SYSTEM_PROXY:
    for proxy_key in [
        "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
        "http_proxy", "https_proxy", "all_proxy"
    ]:
        os.environ.pop(proxy_key, None)

session = http_requests.Session()
# Broken Windows/global proxy settings can block OCR uploads entirely.
# Use direct connections by default; opt back into system proxy via env var.
session.trust_env = USE_SYSTEM_PROXY
if not USE_SYSTEM_PROXY:
    session.proxies.clear()
    session.proxies.update({"http": "", "https": ""})

# ---- Static Files ----
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# ---- Debug ----
@app.route('/api/debug/<job_id>')
def debug_job(job_id):
    """Return the raw result JSON for a completed job."""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    job = jobs[job_id]
    if job["status"] != "done" or not job["result"]:
        return jsonify({"status": job["status"], "error": job["error"]})
    
    # Extract and return the markdown text from each page
    pages_md = []
    for page in job["result"].get("layoutParsingResults", []):
        md_text = page.get("markdown", {}).get("text", "")
        pages_md.append(md_text)
    
    return jsonify({
        "status": "done",
        "pageCount": len(pages_md),
        "markdown": "\n\n---PAGE BREAK---\n\n".join(pages_md),
        "fullResult": job["result"]
    })

# ---- PDF Upload ----
@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files are accepted"}), 400
    
    local_id = str(uuid.uuid4())[:8]
    jobs[local_id] = {
        "status": "submitting",
        "paddleJobId": None,
        "result": None,
        "error": None,
        "progress": None
    }
    
    # Save file temporarily
    temp_dir = os.path.join('.', 'temp_uploads')
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{local_id}.pdf")
    file.save(temp_path)
    
    # Process in background thread
    thread = Thread(target=process_pdf_job, args=(local_id, temp_path))
    thread.daemon = True
    thread.start()
    
    return jsonify({"jobId": local_id, "status": "submitting"})

# ---- Job Status ----
@app.route('/api/status/<job_id>')
def job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = jobs[job_id]
    response = {
        "status": job["status"],
        "progress": job["progress"],
        "error": job["error"]
    }
    
    if job["status"] == "done" and job["result"]:
        response["result"] = job["result"]
    
    return jsonify(response)

# ---- Background Processing ----
def process_pdf_job(local_id, temp_path):
    job = jobs[local_id]
    
    try:
        # 1. Submit to PaddleOCR
        job["status"] = "submitting"
        
        headers = {"Authorization": f"bearer {TOKEN}"}
        data = {
            "model": MODEL,
            "optionalPayload": json.dumps(OPTIONAL_PAYLOAD)
        }
        
        with open(temp_path, "rb") as f:
            files = {"file": f}
            resp = session.post(
                JOB_URL,
                headers=headers,
                data=data,
                files=files,
                timeout=REQUEST_TIMEOUT
            )
        
        if resp.status_code != 200:
            job["status"] = "failed"
            job["error"] = f"PaddleOCR API returned {resp.status_code}: {resp.text[:200]}"
            return
        
        paddle_job_id = resp.json()["data"]["jobId"]
        job["paddleJobId"] = paddle_job_id
        job["status"] = "processing"
        
        # 2. Poll for results
        while True:
            poll_resp = session.get(
                f"{JOB_URL}/{paddle_job_id}",
                headers=headers,
                timeout=REQUEST_TIMEOUT
            )
            if poll_resp.status_code != 200:
                job["status"] = "failed"
                job["error"] = f"Poll failed: {poll_resp.status_code}"
                return
            
            state = poll_resp.json()["data"]["state"]
            
            if state == "pending":
                job["progress"] = "Pending in queue..."
            elif state == "running":
                try:
                    prog = poll_resp.json()["data"]["extractProgress"]
                    total = prog.get("totalPages", "?")
                    done = prog.get("extractedPages", "?")
                    job["progress"] = f"Processing page {done}/{total}..."
                except (KeyError, TypeError):
                    job["progress"] = "Processing..."
            elif state == "done":
                jsonl_url = poll_resp.json()["data"]["resultUrl"]["jsonUrl"]
                break
            elif state == "failed":
                error_msg = poll_resp.json()["data"].get("errorMsg", "Unknown error")
                job["status"] = "failed"
                job["error"] = f"Conversion failed: {error_msg}"
                return
            
            time.sleep(3)
        
        # 3. Download results
        job["progress"] = "Downloading results..."
        jsonl_resp = session.get(jsonl_url, timeout=REQUEST_TIMEOUT)
        jsonl_resp.raise_for_status()
        
        # Debug: save raw response for inspection
        debug_dir = os.path.join('.', 'output')
        os.makedirs(debug_dir, exist_ok=True)
        debug_file = os.path.join(debug_dir, f'debug_{local_id}.json')
        with open(debug_file, 'w', encoding='utf-8') as df:
            df.write(jsonl_resp.text)
        print(f"[DEBUG] Raw API response saved to {debug_file}")
        
        lines = jsonl_resp.text.strip().split('\n')
        all_results = []
        
        img_dir = os.path.join('.', 'ocr_imgs', local_id)
        os.makedirs(img_dir, exist_ok=True)
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            parsed = json.loads(line)
            result = parsed.get("result", parsed)
            
            if "layoutParsingResults" in result:
                for page_res in result["layoutParsingResults"]:
                    # Download images and replace URLs with local paths
                    if "markdown" in page_res and "images" in page_res["markdown"]:
                        new_images = {}
                        for img_path, img_url in page_res["markdown"]["images"].items():
                            try:
                                local_img_name = img_path.replace('/', '_').replace('\\', '_')
                                local_img_path = os.path.join(img_dir, local_img_name)
                                img_bytes = session.get(img_url, timeout=30).content
                                with open(local_img_path, "wb") as img_f:
                                    img_f.write(img_bytes)
                                new_images[img_path] = f"/ocr_imgs/{local_id}/{local_img_name}"
                            except Exception:
                                new_images[img_path] = img_url  # fallback to original URL
                        page_res["markdown"]["images"] = new_images
                    
                    all_results.append(page_res)
        
        # 4. Done
        job["status"] = "done"
        job["result"] = {"layoutParsingResults": all_results}
        job["progress"] = "Complete!"
        
    except ProxyError as e:
        job["status"] = "failed"
        job["error"] = (
            "Conversion service connection failed because a proxy is configured but unreachable. "
            "Paperbase now uses direct connections by default after restart. "
            "If you must use a proxy, set PAPERBASE_USE_SYSTEM_PROXY=1 and restart the server. "
            f"Details: {e}"
        )
    except (ConnectionError, Timeout) as e:
        job["status"] = "failed"
        job["error"] = (
            "Conversion service could not be reached from this machine. Check internet access, firewall/VPN, "
            "or proxy settings, then try again. "
            f"Details: {e}"
        )
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)
    finally:
        # Cleanup temp file
        try:
            os.remove(temp_path)
        except OSError:
            pass

if __name__ == '__main__':
    print("=" * 50)
    print("  Exam Portal Server")
    print("  Open http://localhost:3000 in your browser")
    print("=" * 50)
    app.run(host='0.0.0.0', port=3000, debug=False)
