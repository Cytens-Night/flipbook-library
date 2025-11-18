// Lightweight TTS utility using browser native + Piper TTS
// Piper: High-quality, free, open-source neural TTS hosted on Railway
// https://github.com/rhasspy/piper
export const ttsService = {
  baseURL: 'https://flipbook-library-production.up.railway.app/api',
  piperAvailable: false,
  currentUtterance: null,
  currentAudio: null,
  
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
    const { voice = 'danny', rate = 1.0, pitch = 1.0, onEnd } = options;
    
    // For immediate feedback, use browser native with sentence chunking
    // This starts speaking instantly while Piper would take 2-3 seconds
    return this.speakNative(text, { voice, rate, pitch, onEnd });
    
    /* Piper code kept for reference - can be enabled for higher quality
    // Support longer text for novel reading - increase to 30000 chars (~6k words per request)
    const maxLength = 30000;
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
            voice: voice === 'default' ? 'danny' : voice,
            rate, 
            pitch 
          })
        });

        if (response.ok) {
          console.log('Piper TTS response received, playing audio...');
          const audioBlob = await response.blob();
          const audio = new Audio(URL.createObjectURL(audioBlob));
          audio.onended = onEnd;
          this.currentAudio = audio;
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
    */
  },

  speakNative(text, options = {}) {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return null;
    }

    const { voice = 'default', rate = 1.0, pitch = 1.0, onEnd, onBoundary } = options;
    
    // Map our voice names to browser preferences
    const getVoicePreference = (voiceName) => {
      if (voiceName === 'danny') {
        // Prefer male voices (David, Alex, James, etc.)
        return (v) => {
          const name = v.name.toLowerCase();
          const uri = v.voiceURI.toLowerCase();
          return (
            name.includes('male') ||
            name.includes('david') ||
            name.includes('alex') ||
            name.includes('james') ||
            name.includes('daniel') ||
            name.includes('mark') ||
            uri.includes('male')
          ) && v.lang.startsWith('en');
        };
      } else if (voiceName === 'lessac') {
        // Prefer female voices (Samantha, Victoria, Karen, etc.)
        return (v) => {
          const name = v.name.toLowerCase();
          const uri = v.voiceURI.toLowerCase();
          return (
            name.includes('female') ||
            name.includes('samantha') ||
            name.includes('victoria') ||
            name.includes('karen') ||
            name.includes('susan') ||
            name.includes('zira') ||
            uri.includes('female')
          ) && v.lang.startsWith('en');
        };
      }
      // Default: any English voice
      return (v) => v.lang.startsWith('en');
    };
    
    // Ensure voices are loaded
    const loadVoices = () => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
          };
        }
      });
    };
    
    // Split into smaller chunks for immediate playback
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentIndex = 0;
    let selectedVoice = null;
    
    const speakNext = async () => {
      if (currentIndex >= sentences.length) {
        if (onEnd) onEnd();
        return;
      }
      
      const sentence = sentences[currentIndex].trim();
      if (!sentence) {
        currentIndex++;
        speakNext();
        return;
      }
      
      // Load voice on first sentence
      if (!selectedVoice) {
        const voices = await loadVoices();
        const voiceFilter = getVoicePreference(voice);
        selectedVoice = voices.find(voiceFilter) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        console.log('Using voice:', selectedVoice?.name || 'default');
      }
      
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };
      
      utterance.onboundary = onBoundary;
      
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };
    
    // Start speaking immediately
    window.speechSynthesis.cancel(); // Stop any current speech
    speakNext();
    
    return { stop: () => window.speechSynthesis.cancel() };
  },

  stop() {
    // Stop Piper audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    // Stop browser native TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    this.currentUtterance = null;
  },
  
  // New method: Speak from selected text position
  speakFromSelection(fullText, selectedText, options = {}) {
    const startIndex = fullText.indexOf(selectedText);
    if (startIndex === -1) {
      // If exact match not found, just speak the full text
      return this.speak(fullText, options);
    }
    
    // Extract text from selection point onwards
    const textFromSelection = fullText.substring(startIndex);
    return this.speak(textFromSelection, options);
  }
};
