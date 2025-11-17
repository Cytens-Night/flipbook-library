# TTS Server for Flipbook Library

Lightweight Text-to-Speech backend supporting open-source AI voices.

## Quick Start

```powershell
cd tts-server
npm install
npm start
```

Server runs on `http://localhost:3001`

## Current Implementation

- **Browser-Native TTS**: Uses Web Speech API (zero server load, instant)
- **Architecture**: Ready for Kokoro TTS / Coqui TTS integration

## API Endpoints

### `POST /api/tts`
Generate speech from text
```json
{
  "text": "Hello world",
  "voice": "default",
  "rate": 1.0,
  "pitch": 1.0
}
```

### `GET /api/voices`
List available voices

### `GET /health`
Health check

## Upgrading to Kokoro TTS

1. Install Kokoro TTS:
```powershell
pip install kokoro-tts
```

2. Run Kokoro server:
```powershell
kokoro-serve --port 8080
```

3. Uncomment Kokoro integration code in `server.js`

## Upgrading to Coqui TTS

1. Install Coqui:
```powershell
pip install TTS
```

2. Run TTS server:
```powershell
tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC
```

3. Update server.js to call Coqui endpoint

## Architecture Benefits

- **Lightweight**: No heavy models loaded by default
- **Scalable**: Easy to add Kokoro/Coqui when needed
- **Offline-ready**: Browser TTS works without internet
- **Open-source**: Apache 2.0 licensed models ready
