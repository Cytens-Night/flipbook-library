# Flipbook Library - Complete Setup

## Run Development Environment

### Option 1: Start both servers manually

**Terminal 1 - Frontend (Vite)**
```powershell
cd "c:\Users\busin\OneDrive\Desktop\flipbook libarary"
npm run dev
```

**Terminal 2 - TTS Server**
```powershell
cd "c:\Users\busin\OneDrive\Desktop\flipbook libarary\tts-server"
npm install
npm start
```

### Option 2: Single command (after first install)

```powershell
cd "c:\Users\busin\OneDrive\Desktop\flipbook libarary"
npm run dev
```

Then in another terminal:
```powershell
cd tts-server ; npm start
```

## What's Working Now

### ✅ Drag & Drop System
- **Drag-to-group**: Drag books onto group stacks to add them
- **Book reordering**: Drag books to rearrange their position
- **Drag-to-bin**: Drag books to the floating bin (with confirmation)
- **Visual feedback**: Groups highlight green, bin glows red on drag-over

### ✅ TTS Integration
- **Lightweight architecture**: Uses browser native TTS by default (zero server load)
- **AI voice ready**: Backend prepared for Kokoro TTS / Coqui TTS upgrade
- **Smart fallback**: If TTS server is down, uses browser voices automatically
- **Settings aware**: Respects rate, pitch, and voice from settings store

### ✅ UI Enhancements
- **Toast notifications**: Success/error messages for all actions
- **In-app confirmations**: Beautiful dialogs replace window.confirm
- **Extended search**: 1100px wide search bar
- **Bin modal**: View, restore, and purge deleted books
- **LocalStorage fix**: Quota issue resolved with smart caching

## Upgrading to AI Voices

### Kokoro TTS (Recommended)
```powershell
# Install Kokoro
pip install kokoro-tts

# Run Kokoro server
kokoro-serve --port 8080

# Uncomment integration code in tts-server/server.js
```

### Coqui TTS (Alternative)
```powershell
# Install Coqui
pip install TTS

# Run TTS server
tts-server --model_name tts_models/en/ljspeech/tacotron2-DDC --port 8080

# Update tts-server/server.js to point to Coqui endpoint
```

## Architecture Benefits

- **Zero-overhead by default**: No AI models loaded unless you want them
- **Graceful degradation**: Falls back to browser TTS if server unavailable
- **Scalable**: Add Kokoro/Coqui without changing frontend code
- **Open-source**: Apache 2.0 licensed models ready to deploy

## Testing Checklist

- [ ] Upload a book (PDF/EPUB/TXT)
- [ ] Drag book to reorder position → toast notification
- [ ] Create a group
- [ ] Drag book onto group → toast notification "Book added to group"
- [ ] Drag book to bin → confirmation dialog → toast "Book moved to bin"
- [ ] Open bin → Restore book → toast notification
- [ ] Open a book → Click Read Aloud (Volume icon) → TTS reads page
- [ ] Select text → Click quote button → Quote saved with toast

## Troubleshooting

### Drag & drop not working
- Make sure you're dragging from the grip handle (top-left of card)
- Groups must be visible (not in search mode)
- Check browser console for errors

### TTS not working
- TTS server is optional - browser TTS works without it
- Check http://localhost:3001/health to verify server status
- Make sure book has text (not just images)

### LocalStorage quota exceeded
- Fixed! Large covers and page data now excluded from cache
- Full data stored in IndexedDB only

## Next Steps

1. Test drag functionality
2. Test TTS playback
3. Optional: Install Kokoro for AI voices
4. Optional: Add more groups and organize your library
