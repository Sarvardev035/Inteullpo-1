import os, glob

# Fix imports in src/pages/*.tsx
for f in glob.glob('src/pages/*.tsx'):
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("../../api/", "../api/").replace("../../context/", "../context/")
    with open(f, 'w') as file:
        file.write(content)

# Fix specific type errors in Statistics.tsx
stats_file = 'src/pages/Statistics.tsx'
if os.path.exists(stats_file):
    with open(stats_file, 'r') as file:
        content = file.read()
    # (29,51): Parameter 'i' implicitly has an 'any' type.
    content = content.replace("i => new Date(i.date)", "(i: any) => new Date(i.date)")
    # (52,21): 'b.value' is of type 'unknown'. (52,31): 'a.value' is of type 'unknown'.
    content = content.replace("(a, b) => b.value - a.value", "(a: any, b: any) => b.value - a.value")
    # (97,26): Tooltip formatter Type '(val: number) => string' is not assignable
    content = content.replace("formatter={(val: number)", "formatter={(val: any)")
    with open(stats_file, 'w') as file:
        file.write(content)

# Fix specific type errors in Transfers.tsx
trf_file = 'src/pages/Transfers.tsx'
if os.path.exists(trf_file):
    with open(trf_file, 'r') as file:
        content = file.read()
    # (22,33): Parameter 'a' implicitly has an 'any' type.
    content = content.replace("a => a.id", "(a: any) => a.id")
    content = content.replace("a => a.name", "(a: any) => a.name")
    with open(trf_file, 'w') as file:
        file.write(content)

