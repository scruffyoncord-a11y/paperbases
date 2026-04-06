import json, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

for fname in ['output/debug_90b8140b.json', 'output/debug_a5997c6f.json']:
    print(f"\n{'='*60}")
    print(f"FILE: {fname}")
    print(f"{'='*60}")
    
    with open(fname, 'r', encoding='utf8') as f:
        raw = f.read()

    decoder = json.JSONDecoder()
    pos = 0
    results = []
    while pos < len(raw):
        raw_stripped = raw[pos:].lstrip()
        if not raw_stripped:
            break
        try:
            obj, end = decoder.raw_decode(raw_stripped)
            results.append(obj)
            pos += len(raw) - len(raw_stripped) - pos + end
        except json.JSONDecodeError:
            break

    print(f"Found {len(results)} JSON objects")

    for ri, j in enumerate(results):
        pages = None
        if 'result' in j and 'layoutParsingResults' in j.get('result', {}):
            pages = j['result']['layoutParsingResults']
        elif 'layoutParsingResults' in j:
            pages = j['layoutParsingResults']
        
        if not pages:
            continue
        
        print(f"  Object {ri}: {len(pages)} pages")
        
        for i, p in enumerate(pages):
            text = p['markdown']['text']
            imgs = list(p['markdown'].get('images', {}).keys())
            lower = text.lower()
            
            has_table = '<table' in lower
            has_match = 'match' in lower
            has_img_opt = '<img' in text and any(k in lower for k in ['(a)', '(b)', '(c)', '(d)'])
            has_pipe_table = text.count('|') > 5
            
            if has_table or has_match or has_img_opt or has_pipe_table:
                tag = []
                if has_table: tag.append('TABLE')
                if has_pipe_table: tag.append('PIPE_TABLE')
                if has_match: tag.append('MATCH')
                if has_img_opt: tag.append('IMG+OPT')
                print(f'\n=== OBJ {ri} PAGE {i} [{",".join(tag)}] ===')
                print(text[:5000])
                if imgs:
                    print(f'--- IMAGES: {imgs[:10]}')
