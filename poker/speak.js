/**
 * TextToSpeech - A simple text-to-speech library using the Web Speech API
 * 
 * Usage:
 * TextToSpeech.speak("Hello world");
 * TextToSpeech.setVoice('Google UK English Female');
 * TextToSpeech.setRate(1.2);
 * TextToSpeech.pause();
 * TextToSpeech.resume();
 * TextToSpeech.cancel();
 */

const TextToSpeech = (function() {
    // Private variables
    let speechSynthesis = window.speechSynthesis;
    let speechUtterance = null;
    let voices = [];
    let selectedVoice = null;
    let rate = 1.0;
    let pitch = 1.0;
    let volume = 1.0;
    let isInitialized = false;
    
    // Initialize voices - needed for Chrome
    function initVoices() {
        return new Promise((resolve) => {
            // Chrome loads voices asynchronously
            speechSynthesis.onvoiceschanged = function() {
                voices = speechSynthesis.getVoices();
                isInitialized = true;
                resolve();
            };
            
            // Firefox has voices immediately
            voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                isInitialized = true;
                resolve();
            }
        });
    }
    
    // Initialize the library
    initVoices();
    
    return {
        /**
         * Speak the given text
         * @param {string} text - The text to speak
         * @param {function} onEnd - Optional callback when speech finishes
         */
        speak: function(text, onEnd) {
            if (!isInitialized) {
                console.warn("Speech synthesis not yet initialized. Trying again...");
                initVoices().then(() => this.speak(text, onEnd));
                return;
            }
            
            // Cancel any current speech
            this.cancel();
            
            // Create new utterance
            speechUtterance = new SpeechSynthesisUtterance(text);
            speechUtterance.voice = selectedVoice || voices.find(voice => voice.default) || voices[0];
            speechUtterance.rate = rate;
            speechUtterance.pitch = pitch;
            speechUtterance.volume = volume;
            
            if (onEnd) {
                speechUtterance.onend = onEnd;
            }
            
            speechSynthesis.speak(speechUtterance);
        },
        
        /**
         * Set the voice by name
         * @param {string} voiceName - The name of the voice to use
         */
        setVoice: function(voiceName) {
            if (!isInitialized) {
                console.warn("Speech synthesis not yet initialized.");
                return;
            }
            
            const voice = voices.find(v => v.name === voiceName);
            if (voice) {
                selectedVoice = voice;
            } else {
                console.warn(`Voice '${voiceName}' not found. Available voices:`);
                console.log(voices);
            }
        },
        
        /**
         * Set the speech rate (0.1 to 10)
         * @param {number} newRate - The speech rate
         */
        setRate: function(newRate) {
            rate = Math.min(10, Math.max(0.1, newRate));
        },
        
        /**
         * Set the speech pitch (0 to 2)
         * @param {number} newPitch - The speech pitch
         */
        setPitch: function(newPitch) {
            pitch = Math.min(2, Math.max(0, newPitch));
        },
        
        /**
         * Set the speech volume (0 to 1)
         * @param {number} newVolume - The speech volume
         */
        setVolume: function(newVolume) {
            volume = Math.min(1, Math.max(0, newVolume));
        },
        
        /**
         * Pause current speech
         */
        pause: function() {
            speechSynthesis.pause();
        },
        
        /**
         * Resume paused speech
         */
        resume: function() {
            speechSynthesis.resume();
        },
        
        /**
         * Cancel current speech
         */
        cancel: function() {
            speechSynthesis.cancel();
        },
        
        /**
         * Get all available voices
         * @returns {Array} Array of voice objects
         */
        getVoices: function() {
            return voices;
        },
        
        /**
         * Check if speech is currently in progress
         * @returns {boolean} True if speaking
         */
        isSpeaking: function() {
            return speechSynthesis.speaking;
        },
        
        /**
         * Check if speech is paused
         * @returns {boolean} True if paused
         */
        isPaused: function() {
            return speechSynthesis.paused;
        }
    };
})();