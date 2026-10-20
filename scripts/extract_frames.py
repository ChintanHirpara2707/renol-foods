import re, json, base64, sys, pathlib

if len(sys.argv) < 3:
    sys.exit("Usage: python scripts/extract_frames.py <html file> <output folder>")

path = pathlib.Path(sys.argv[1])
src = path.read_text(encoding="utf-8", errors="ignore")
print(f"Read {path} ({len(src):,} characters)")

m = re.search(r'<script[^>]*id\s*=\s*["\']lemonFrames["\'][^>]*>(.*?)</script>', src, re.S | re.I)
if not m:
    if not re.search(r'id\s*=\s*["\']lemonFrames["\']', src):
        sys.exit("ERROR: the frames data is missing from this file (it was removed or the file is a "
                 "different version). Use the client's ORIGINAL file, about 718,914 bytes.")
    sys.exit("ERROR: the frames tag exists but is not closed properly. The file may be cut off. "
             "Use the client's ORIGINAL file.")

frames = json.loads(m.group(1).strip())
out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
for i, f in enumerate(frames):
    b64 = f.split(",", 1)[1]
    (out / f"{i:02d}.webp").write_bytes(base64.b64decode(b64))
print(len(frames), "frames written to", out)