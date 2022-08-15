
import json

with open('all.milers.json') as f:
    data = json.loads(f.read())

i = 0
for row in data:
    i += 1
    print("\t".join([str(i), row['name'], row['result'], row['readable_date'], row['location']]))


