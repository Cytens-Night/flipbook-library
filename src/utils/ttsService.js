// Lightweight TTS utility using browser native + Piper TTS
// Piper: High-quality, free, open-source neural TTS that runs locally
// https://github.com/rhasspy/piper
export const ttsService = {
  baseURL: 'http://localhost:3001/api',
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
    
    // Check Piper availability first
    if (!this.piperAvailable) {
      await this.checkPiper();
    }
    
    // Try Piper TTS if available
    if (this.piperAvailable) {
      try {
        const response = await fetch(`${this.baseURL}/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text, 
            voice: voice === 'default' ? 'en_US-lessac-medium' : voice,
            rate, 
            pitch 
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audio = new Audio(URL.createObjectURL(audioBlob));
          audio.onended = onEnd;
          await audio.play();
          return audio;
        }
      } catch (error) {
        console.warn('Piper TTS unavailable, falling back to browser:', error);
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
