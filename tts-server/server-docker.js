import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PIPER_PATH = '/app/piper/piper';
const MODEL_PATH = '/app/en_US-lessac-medium.onnx';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Piper TTS Server',
    model: 'en_US-lessac-medium'
  });
});

// TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, rate = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Piper TTS
    const tempFile = join(tmpdir(), `tts-${Date.now()}.wav`);
    const piper = spawn(PIPER_PATH, [
      '--model', MODEL_PATH,
      '--output_file', tempFile,
      '--length_scale', String(1.0 / rate)
    ]);

    piper.stdin.write(text);
    piper.stdin.end();

    piper.on('close', (code) => {
      if (code === 0 && existsSync(tempFile)) {
        res.set('Content-Type', 'audio/wav');
        res.sendFile(tempFile, () => {
          try { unlinkSync(tempFile); } catch (e) { }
        });
      } else {
        res.status(500).json({ error: 'TTS generation failed', code });
      }
    });

    piper.on('error', (error) => {
      res.status(500).json({ error: 'Piper execution failed', details: error.message });
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'TTS processing failed', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Piper TTS Server running on port ${PORT}`);
});
