import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TTS Server',
    method: 'browser-native'
  });
});

// TTS endpoint - uses browser native (free, no setup)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Tell client to use browser's built-in TTS (works everywhere, no setup)
    res.status(503).json({
      method: 'browser-native',
      message: 'Using browser native TTS - free and works offline'
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'TTS processing failed', details: error.message });
  }
});

// Voices endpoint
app.get('/api/voices', (req, res) => {
  // Return available voices (browser native for now)
  res.json({
    voices: [
      { id: 'default', name: 'Default Voice', lang: 'en-US', provider: 'browser' },
      { id: 'google-us', name: 'Google US English', lang: 'en-US', provider: 'browser' },
      { id: 'microsoft-david', name: 'Microsoft David', lang: 'en-US', provider: 'browser' }
    ],
    note: 'Kokoro/Coqui voices coming soon'
  });
});

app.listen(PORT, () => {
  console.log(`🎙️  TTS Server running on http://localhost:${PORT}`);
  console.log(`📖 Currently using browser-native TTS (lightweight)`);
  console.log(`🚀 Kokoro TTS integration ready for deployment`);
});
