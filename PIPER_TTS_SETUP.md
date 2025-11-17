# Piper TTS Setup Guide

**Piper** is a completely free, open-source neural text-to-speech system that produces realistic, natural voices and runs 100% locally on your computer.

## Why Piper?

- ✅ **Completely Free** - No API costs, no subscriptions
- ✅ **Open Source** - MIT licensed, community-driven
- ✅ **High Quality** - Neural TTS with natural-sounding voices
- ✅ **Offline** - Runs locally, no internet required
- ✅ **Fast** - Optimized for CPU inference
- ✅ **Privacy** - Your text never leaves your computer
- ✅ **Multiple Voices** - 50+ voices in 20+ languages

## Installation

### Windows (Recommended)

1. **Download Piper for Windows:**
   ```
   https://github.com/rhasspy/piper/releases/latest
   ```
   Download: `piper_windows_amd64.zip`

2. **Extract the ZIP** to a folder (e.g., `C:\piper`)

3. **Download a Voice Model:**
   - Visit: https://rhasspy.github.io/piper-samples/
   - Recommended: `en_US-lessac-medium` (high quality, balanced)
   - Download both `.onnx` and `.onnx.json` files
   - Place them in the piper folder

4. **Add Piper to PATH** (or set environment variable):
   ```powershell
   $env:PIPER_PATH = "C:\piper\piper.exe"
   ```

5. **Test Piper:**
   ```powershell
   cd C:\piper
   echo "Hello, this is a test" | .\piper.exe --model en_US-lessac-medium --output_file test.wav
   ```

### Linux/Mac

1. **Download Piper:**
   ```bash
   # Linux
   wget https://github.com/rhasspy/piper/releases/latest/download/piper_linux_x86_64.tar.gz
   tar -xzf piper_linux_x86_64.tar.gz
   
   # Mac
   brew install piper-tts
   ```

2. **Download Voice Model:**
   ```bash
   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx
   wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json
   ```

3. **Test:**
   ```bash
   echo "Hello, this is a test" | ./piper --model en_US-lessac-medium --output_file test.wav
   ```

## Usage in Flipbook Library

Once Piper is installed:

1. **Start the TTS server:**
   ```bash
   cd tts-server
   npm start
   ```

2. **The app will automatically:**
   - Detect Piper availability
   - Use Piper for high-quality speech
   - Fall back to browser TTS if Piper is unavailable

## Voice Options

### High-Quality English Voices:
- `en_US-lessac-medium` - Natural female voice (recommended)
- `en_US-lessac-high` - Highest quality female voice
- `en_US-libritts-high` - Multiple speakers available
- `en_GB-southern_english_female-medium` - British English

### Other Languages:
- Spanish: `es_ES-mls-medium`
- French: `fr_FR-mls-medium`
- German: `de_DE-thorsten-medium`
- Italian: `it_IT-riccardo-medium`
- Japanese: `ja_JP-kokoro-medium`

**Full list:** https://huggingface.co/rhasspy/piper-voices/tree/main

## Troubleshooting

### "Piper TTS not available"
- Make sure piper.exe is in your PATH or set `PIPER_PATH` environment variable
- Verify the voice model files (.onnx and .onnx.json) are in the same folder as piper

### "Model not found"
- Download the .onnx and .onnx.json files for your chosen voice
- Place them in the piper installation folder
- Use the exact model name (e.g., `en_US-lessac-medium`)

### Slow Performance
- Use `-medium` quality voices instead of `-high` for faster processing
- Piper is CPU-optimized and works well on most modern computers

## Alternative: Web Speech API

If you don't want to install Piper, the app automatically falls back to your browser's built-in TTS (Web Speech API), which is also free but may have:
- Less natural voices
- Internet dependency (on some browsers)
- Limited voice customization

## Resources

- **Piper GitHub:** https://github.com/rhasspy/piper
- **Voice Samples:** https://rhasspy.github.io/piper-samples/
- **Voice Downloads:** https://huggingface.co/rhasspy/piper-voices
- **Documentation:** https://github.com/rhasspy/piper/blob/master/README.md
