import sys
import os
import json
import datetime
import random
from pathlib import Path

# Paths from user request
JEE_REPO = r'C:\Users\renjith\jee_mains_pyqs_data_base'
CACHE_DIR = Path(r'C:\Users\renjith\jee_mains_pyqs_data_base\jee_data_base\cache')
SCHEMA = 'v007'

sys.path.insert(0, JEE_REPO)

try:
    from jee_data_base.core.cache import Cache
    cache = Cache(cache_path=CACHE_DIR, schema_version=SCHEMA)
    CHAPTERS_DICT = cache.load_cache_pkl("DataBaseChapters")
    
    ALL_QUESTIONS = []
    for chap in CHAPTERS_DICT.values():
        ALL_QUESTIONS.extend(chap.question_dict.values())
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)

def make_q(q, index=None):
    options = []
    for opt in (q.options or []):
        options.append(opt.get("content", "") if isinstance(opt, dict) else str(opt))

    letters = []
    for co in (q.correct_options or []):
        if isinstance(co, int):
            letters.append(chr(65 + co))
        elif isinstance(co, str) and co.isdigit():
            letters.append(chr(65 + int(co)))
        else:
            letters.append(str(co))

    return {
        "index":            index,
        "question_id":      q.question_id,
        "question":         q.question    or "",
        "subject":          q.subject     or "",
        "chapter":          q.chapter     or "",
        "year":             q.year        or "",
        "topic":            q.topic       or "",
        "type":             q.type        or "mcq",
        "difficulty":       q.difficulty  or "",
        "examDate":         str(q.examDate) if q.examDate else "",
        "options":          options,
        "correct_options":  letters,
        "answer":           str(q.answer) if q.answer is not None else "",
        "explanation":      q.explanation or "",
        "isImgQuestion":    q.isImgQuestion,
        "isImgOption":      q.isImgOption,
        "isImgExplanation": q.isImgExplanation,
    }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        return

    cmd = sys.argv[1]

    if cmd == "chapters":
        result = {}
        for key, chap in CHAPTERS_DICT.items():
            subj = chap.parent_subject or "Other"
            result.setdefault(subj, []).append({
                "key": key,
                "name": chap.name or key,
                "total": chap.total_questions,
            })
        for subj in result:
            result[subj].sort(key=lambda x: x["name"])
        print(json.dumps({"success": True, "chapters": result}))

    elif cmd == "questions":
        chapter_key = sys.argv[2] if len(sys.argv) > 2 else ""
        years_param = sys.argv[3] if len(sys.argv) > 3 else "last_5"
        limit = int(sys.argv[4]) if len(sys.argv) > 4 else 30
        
        if chapter_key not in CHAPTERS_DICT:
            print(json.dumps({"success": False, "error": f"Chapter {chapter_key} not found"}))
            return

        chap_name = CHAPTERS_DICT[chapter_key].name
        qs = [q for q in ALL_QUESTIONS if q.chapter == chap_name]

        # Filter by year
        current_year = datetime.datetime.now().year
        if years_param.startswith("last_"):
            n = int(years_param.split("_")[1])
            allowed_years = set(range(current_year - n + 1, current_year + 1))
            qs = [q for q in qs if q.year in allowed_years]
        
        random.shuffle(qs)
        qs = qs[:limit]
        
        print(json.dumps({"success": True, "questions": [make_q(q, i+1) for i, q in enumerate(qs)]}))

if __name__ == "__main__":
    main()
