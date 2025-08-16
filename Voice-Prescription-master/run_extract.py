#!/usr/bin/env python
"""
Command-line wrapper that calls the existing extract pipeline and prints JSON.

Usage:
  python run_extract.py --text "patient text here"
  echo "...text..." | python run_extract.py --stdin

This keeps the core extraction logic in `extract_text.py` and provides a
stable JSON output for the frontend to consume.
"""
import sys
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--text', '-t', help='Text to extract from')
parser.add_argument('--stdin', action='store_true', help='Read text from stdin')
args = parser.parse_args()

text = ''
if args.stdin:
    text = sys.stdin.read()
elif args.text:
    text = args.text
else:
    parser.print_help()
    sys.exit(2)

text = text.strip()
if not text:
    print(json.dumps({'error': 'no text provided'}))
    sys.exit(1)

try:
    # Import local module (same folder)
    from extract_text import extract

    name, age, date, tablet = extract(text)

    # tablet is a list of lists like [[name, strength, duration], ...]
    medications = []
    for t in tablet:
        # normalize to object
        med = {
            'name': t[0] if len(t) > 0 else '',
            'strength': t[1] if len(t) > 1 else '',
            'duration_or_freq': t[2] if len(t) > 2 else ''
        }
        medications.append(med)

    result = {
        'patient': {
            'name': name,
            'age': age,
            'date': date
        },
        'medications': medications,
        'raw_text': text
    }

    print(json.dumps(result))
except Exception as e:
    print(json.dumps({'error': str(e)}))
    sys.exit(1)
