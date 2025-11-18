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
const VOICE_MODELS = {
  'danny': '/app/en_US-danny-low.onnx',        // Softer male narrator (default)
  'lessac': '/app/en_US-lessac-medium.onnx'    // Alternative female
};
const DEFAULT_VOICE = 'danny';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Piper TTS Server',
    defaultVoice: DEFAULT_VOICE,
    availableVoices: Object.keys(VOICE_MODELS)
  });
});

// TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, rate = 1.0, voice = DEFAULT_VOICE } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Select voice model
    const modelPath = VOICE_MODELS[voice] || VOICE_MODELS[DEFAULT_VOICE];

    // Support longer documents - increase limit to 50000 chars (~10k words)
    const maxLength = 50000;
    const processedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;

    console.log(`[TTS] Processing ${processedText.length} characters with voice: ${voice}`);

    // Use Piper TTS
    const tempFile = join(tmpdir(), `tts-${Date.now()}.wav`);
    const piper = spawn(PIPER_PATH, [
      '--model', modelPath,
      '--output_file', tempFile,
      '--length_scale', String(1.0 / rate)
    ]);

    let stderr = '';
    
    piper.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    piper.stdin.write(processedText);
    piper.stdin.end();

    piper.on('close', (code) => {
      if (code === 0 && existsSync(tempFile)) {
        console.log(`[TTS] Success - generated ${tempFile}`);
        res.set('Content-Type', 'audio/wav');
        res.sendFile(tempFile, () => {
          try { unlinkSync(tempFile); } catch (e) { }
        });
      } else {
        console.error(`[TTS] Failed with code ${code}:`, stderr);
        res.status(500).json({ error: 'TTS generation failed', code, details: stderr });
      }
    });

    piper.on('error', (error) => {
      console.error('[TTS] Piper spawn error:', error);
      res.status(500).json({ error: 'Piper execution failed', details: error.message });
    });

  } catch (error) {
    console.error('[TTS] Error:', error);
    res.status(500).json({ error: 'TTS processing failed', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Piper TTS Server running on port ${PORT}`);
});
