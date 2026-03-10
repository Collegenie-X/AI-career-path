"""Merge all parts and write final career-path-templates.json"""
import json, os, subprocess, sys

scripts_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(scripts_dir, "..", "frontend", "data")

# Run each part
for part in ["gen_templates_part1.py", "gen_templates_part2.py", "gen_templates_part3.py"]:
    result = subprocess.run([sys.executable, os.path.join(scripts_dir, part)], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR in {part}:\n{result.stderr}")
        sys.exit(1)
    print(result.stdout.strip())

# Load and merge
all_templates = []
for part_file in ["part1_data.json", "part2_data.json", "part3_data.json"]:
    with open(os.path.join(scripts_dir, part_file), encoding="utf-8") as f:
        all_templates.extend(json.load(f))

# Write final output
out_path = os.path.join(data_dir, "career-path-templates.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_templates, f, ensure_ascii=False, indent=2)

print(f"\nFinal file written: {out_path}")
print(f"Total templates: {len(all_templates)}")
for t in all_templates:
    total = 0
    for y in t["years"]:
        for g in y.get("goalGroups", []):
            total += len(g["items"])
        for sp in y.get("semesterPlans", []):
            for g in sp["goalGroups"]:
                total += len(g["items"])
    groups_per_year = []
    for y in t["years"]:
        gc = len(y.get("goalGroups", []))
        for sp in y.get("semesterPlans", []):
            gc += len(sp["goalGroups"])
        groups_per_year.append(gc)
    print(f"  {t['jobName']}: {total} items, groups/year={groups_per_year}")
