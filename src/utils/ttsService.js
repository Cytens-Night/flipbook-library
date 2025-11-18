// Lightweight TTS utility using browser native + Piper TTS
// Piper: High-quality, free, open-source neural TTS hosted on Railway
// https://github.com/rhasspy/piper
export const ttsService = {
  baseURL: 'https://flipbook-library-production.up.railway.app/api',
  piperAvailable: false,
  
  // Check if Piper TTS server is running
  async checkPiper() {
    try {
      const response = await fetch(`${this.baseURL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });
      this.piperAvailable = response.ok;
      return this.piperAvailable;
    } catch (error) {
      this.piperAvailable = false;
      return false;
    }
  },
  
  async getVoices() {
    try {
      const response = await fetch(`${this.baseURL}/voices`);
      if (!response.ok) throw new Error('Failed to fetch voices');
      return await response.json();
    } catch (error) {
      console.warn('TTS server unavailable, using browser native:', error);
      // Fallback to browser native voices
      return {
        voices: window.speechSynthesis?.getVoices().map(v => ({
          id: v.voiceURI,
          name: v.name,
          lang: v.lang,
          provider: 'browser'
        })) || []
      };
    }
  },

  async speak(text, options = {}) {
    const { voice = 'default', rate = 1.0, pitch = 1.0, onEnd } = options;
    
    // Limit text length on client side too (reasonable single-page limit)
    const maxLength = 3000;
    let processedText = text.trim();
    
    if (processedText.length > maxLength) {
      console.warn(`Text too long (${processedText.length} chars), truncating to ${maxLength}`);
      // Try to cut at sentence boundary
      processedText = processedText.substring(0, maxLength);
      const lastPeriod = processedText.lastIndexOf('.');
      const lastQuestion = processedText.lastIndexOf('?');
      const lastExclaim = processedText.lastIndexOf('!');
      const cutPoint = Math.max(lastPeriod, lastQuestion, lastExclaim);
      if (cutPoint > maxLength * 0.8) {
        processedText = processedText.substring(0, cutPoint + 1);
      }
    }
    
    // Always try Piper first - check availability if not yet checked
    if (!this.piperAvailable) {
      console.log('Checking Piper TTS availability...');
      await this.checkPiper();
    }
    
    // Try Piper TTS
    console.log('Piper available:', this.piperAvailable);
    if (this.piperAvailable) {
      try {
        console.log('Requesting Piper TTS for text:', processedText.substring(0, 50) + '...');
        const response = await fetch(`${this.baseURL}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: processedText, 
            voice: voice === 'default' ? 'en_US-lessac-medium' : voice,
            rate, 
            pitch 
          })
        });

        if (response.ok) {
          console.log('Piper TTS response received, playing audio...');
          const audioBlob = await response.blob();
          const audio = new Audio(URL.createObjectURL(audioBlob));
          audio.onended = onEnd;
          await audio.play();
          return audio;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Piper TTS request failed:', response.status, response.statusText, errorData);
        }
      } catch (error) {
        console.warn('Piper TTS error, falling back to browser:', error);
        this.piperAvailable = false;
      }
    }
    
    // Fallback to browser native TTS
    return this.speakNative(text, { voice, rate, pitch, onEnd });
  },

  speakNative(text, options = {}) {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return null;
    }

    const { voice = 'default', rate = 1.0, pitch = 1.0, onEnd } = options;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Try to match voice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.voiceURI === voice || v.name.includes(voice));
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.onend = onEnd;
    window.speechSynthesis.cancel(); // Stop any current speech
    window.speechSynthesis.speak(utterance);
    
    return utterance;
  },

  stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};
