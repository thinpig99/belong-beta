# belong-beta

Pitch demo of **belong**, a social discovery agent. The AI manager chats with the user, learns their personality and preferences, and proposes a small community activity in London.

## Demo tips
- Tap the splash screen to start.
- belong speaks each question, then the big mic turns on by itself. Tap it to play the next scripted answer as a live caption (simulated voice), or tap one of the answer buttons.
- The button to the right of the mic switches to typing (and mutes belong) and back.
- At the proposal, choose **Yes, count me in** or **Show me another**.
- The menu (top left) shows History; the gear (top right) shows the account menu. **Log Out** resets the demo.

## Stack
Static HTML/CSS/JS, no build step. Deployed on Vercel.

## belong's voice
Every line belong says is pre-recorded in `audio/` (Kokoro TTS, voice `bf_alice`, speed 0.97), named by a hash of the text. Lines without a recording fall back to the browser's built-in speech.

If you change any of belong's lines in `app.js`, re-record them:
1. Serve the site locally (`python3 -m http.server 8765`) and run `tools/list_lines.py` to write `lines.json`.
2. Put `kokoro-v1.0.onnx` and `voices-v1.0.bin` (kokoro-onnx GitHub release `model-files-v1.0`) next to it and run `tools/render_voice.py 0 1`.
3. Copy the new files from `out/` into `audio/`.
