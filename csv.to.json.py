import os, argparse, csv, json
from datetime import datetime

expected_columns = set([
    'date',
    'index',
    'location',
    'name',
    'result',
    'category',
])

parser = argparse.ArgumentParser(prog='reformat')
parser.add_argument('csv_filename')
args = parser.parse_args()

parsed = []

with open(args.csv_filename, encoding="utf-8") as f:
    csv_reader = csv.DictReader(f)
    present_columns = set(map(lambda f: f.lower(), csv_reader.fieldnames))

    if not present_columns.issuperset(expected_columns):
        print(f"Must have {expected_columns}, found {present_columns}")
        exit(1)

    for row in csv_reader:
        row = {
          k.lower(): v.strip()
          for k, v in row.items()
          if k.lower() in expected_columns
        }
        parsed.append(row)

print(json.dumps(parsed, sort_keys=True, indent=2, ensure_ascii=False))
