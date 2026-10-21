import json, os, re, sys, subprocess, soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
part, parts = int(sys.argv[1]), int(sys.argv[2])
os.makedirs("out", exist_ok=True)
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
def tts_text(t):
    t = re.sub(r"\b(\d{1,2}):00 (AM|PM)", r"\1 \2", t)
    t = re.sub(r"\b(\d{1,2}):30 (AM|PM)", r"\1 thirty \2", t)
    t = t.replace("...", ".")
    return t
lines = json.load(open("lines.json"))
for i, l in enumerate(lines):
    if i % parts != part: continue
    mp3 = f"out/{l['key']}.mp3"
    if os.path.exists(mp3): continue
    samples, sr = k.create(tts_text(l["text"]), voice="bf_alice", speed=0.97, lang="en-gb")
    wav = f"out/{l['key']}.wav"
    sf.write(wav, samples, sr)
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",wav,"-ac","1","-b:a","48k",mp3], check=True)
    os.remove(wav)
    print(part, i, flush=True)
