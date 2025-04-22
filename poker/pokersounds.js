const toggleSoundBtn = document.getElementById('toggleSound');

function setupSoundControls() {
    // Load sound preference from localStorage
    const savedSoundPref = localStorage.getItem('pokerClockSoundEnabled');
    soundEnabled = savedSoundPref ? savedSoundPref === 'true' : true;
    updateSoundButton();
    
    toggleSoundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('pokerClockSoundEnabled', soundEnabled);
        updateSoundButton();
        // Play a test sound when toggling (optional)
        if (soundEnabled) playTestSound();
    });
}

function updateSoundButton() {
    if (soundEnabled) {
        toggleSoundBtn.classList.remove('muted');
        toggleSoundBtn.title = "Mute sounds";
    } else {
        toggleSoundBtn.classList.add('muted');
        toggleSoundBtn.title = "Unmute sounds";
    }
}

function playWarningSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.2;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playTestSound() {
    if (!soundEnabled) return;
    // Brief beep to confirm sound is working
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playBreakSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Pentatonic scale notes (C4, D4, E4, G4, A4)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00];
    
    // Create 5-7 randomized chimes
    const chimeCount = 5 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < chimeCount; i++) {
        const note = scale[Math.floor(Math.random() * scale.length)];
        const delay = i * 0.3 + Math.random() * 0.2;
        
        // Main tone
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = note;
        osc1.detune.value = (Math.random() * 4) - 2; // Slight natural detuning
        
        // Harmonic overtone (12th above)
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = note * 3; // Perfect 12th harmonic
        osc2.detune.value = (Math.random() * 4) - 2;
        
        // Create natural decay
        gain1.gain.setValueAtTime(0.15, now + delay);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + delay + 2);
        
        gain2.gain.setValueAtTime(0.07, now + delay);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.5);
        
        // Apply slight stereo panning
        const panner1 = audioContext.createStereoPanner();
        const panner2 = audioContext.createStereoPanner();
        panner1.pan.value = (Math.random() * 0.6) - 0.3;
        panner2.pan.value = (Math.random() * 0.6) - 0.3;
        
        // Connect nodes
        osc1.connect(gain1).connect(panner1).connect(audioContext.destination);
        osc2.connect(gain2).connect(panner2).connect(audioContext.destination);
        
        // Start/stop
        osc1.start(now + delay);
        osc1.stop(now + delay + 2);
        
        osc2.start(now + delay);
        osc2.stop(now + delay + 2.5);
    }
    
    // Add subtle wind noise background
    const noise = audioContext.createBufferSource();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 500;
    
    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 5);
    
    noise.buffer = noiseBuffer;
    noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);
    noise.start(now);
    noise.stop(now + 5);
}

function playAdjustmentSound() {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 600;
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playRoundChangeSound() {
    if (!soundEnabled) return;
    
    // Create audio context (works in most modern browsers)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playVictoryFanfare() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Zelda-inspired victory melody (C5, E5, G5, C6)
    const notes = [
        { freq: 523.25, start: 0.0, duration: 0.3 }, // C5
        { freq: 659.25, start: 0.3, duration: 0.3 }, // E5
        { freq: 783.99, start: 0.6, duration: 0.3 }, // G5
        { freq: 1046.50, start: 0.9, duration: 0.5 } // C6
    ];
    
    // Add harmonic overtone for richer sound
    const overtoneNotes = [
        { freq: 1046.50, start: 0.0, duration: 0.3 }, // C6
        { freq: 1318.51, start: 0.3, duration: 0.3 }, // E6
        { freq: 1567.98, start: 0.6, duration: 0.3 }, // G6
        { freq: 2093.00, start: 0.9, duration: 0.5 }  // C7
    ];
    
    // Play main melody
    notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0.2, now + note.start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration);
    });
    
    // Play harmonic overtone (softer)
    overtoneNotes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0.1, now + note.start);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration);
    });
    
    // Add trumpet-like attack at beginning
    const attackOsc = audioContext.createOscillator();
    const attackGain = audioContext.createGain();
    attackOsc.type = 'sawtooth';
    attackOsc.frequency.value = 523.25; // C5
    attackGain.gain.setValueAtTime(0.3, now);
    attackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    attackOsc.connect(attackGain);
    attackGain.connect(audioContext.destination);
    attackOsc.start(now);
    attackOsc.stop(now + 0.1);
    
    // Add drum hit at the end (1.4 seconds)
    setTimeout(() => {
        if (soundEnabled) {
            const drumGain = audioContext.createGain();
            const drumOsc = audioContext.createOscillator();
            drumOsc.type = 'triangle';
            drumOsc.frequency.value = 100;
            drumGain.gain.setValueAtTime(0.5, now);
            drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            drumOsc.connect(drumGain);
            drumGain.connect(audioContext.destination);
            drumOsc.start(now + 1.4);
            drumOsc.stop(now + 1.5);
        }
    }, 0);
}

function playMelodiousAlert() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create three oscillators for a chord
    const notes = [
        { freq: 784.00, duration: 0.3 }, // G5
        { freq: 659.25, duration: 0.3 }, // E5
        { freq: 523.25, duration: 0.5 }  // C5
    ];
    
    notes.forEach((note, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + (i * 0.1)); // Stagger the notes slightly
        osc.stop(now + note.duration + (i * 0.1));
    });
}

//play a wind chime sound
function playWindChime() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Wind chime sound
    const chimeFreqs = [440, 554.37, 659.25, 739.99, 880];
    const chimeDurations = [0.3, 0.4, 0.5, 0.6];
    
    chimeFreqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + chimeDurations[i % chimeDurations.length]);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + (i * 0.2));
        osc.stop(now + chimeDurations[i % chimeDurations.length] + (i * 0.2));
    });
}

//play a boing sound
function playBoingSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create a boing sound using a square wave
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 440; // A4
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
}
