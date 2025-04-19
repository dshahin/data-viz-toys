document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timeRemainingEl = document.getElementById('timeRemaining');
    const roundNumberEl = document.getElementById('roundNumber');
    const blindsDisplayEl = document.getElementById('blindsDisplay');
    const anteDisplayEl = document.getElementById('anteDisplay');
    const roundsListEl = document.getElementById('roundsList');
    const structureNameEl = document.getElementById('structureName');
    
    // Buttons
    const playPauseBtn = document.getElementById('playPause');
    const prevRoundBtn = document.getElementById('prevRound');
    const colorChangeBtn = document.getElementById('colorChange');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
    const nextRoundBtn = document.getElementById('nextRound');
    const resetRoundBtn = document.getElementById('resetRound');
    const addBreakBtn = document.getElementById('addBreak');
    const manageStructureBtn = document.getElementById('manageStructure');
    
    // Modal Elements
    const modal = document.getElementById('structureModal');
    const closeBtn = document.querySelector('.close');
    const structureNameInput = document.getElementById('structureNameInput');
    const saveStructureBtn = document.getElementById('saveStructure');
    const newStructureBtn = document.getElementById('newStructure');
    const importCSVBtn = document.getElementById('importCSV');
    const exportCSVBtn = document.getElementById('exportCSV');
    const addRoundBtn = document.getElementById('addRound');
    const csvDataEl = document.getElementById('csvData');
    const savedStructuresList = document.getElementById('savedStructuresList');
    const stickyHeader = document.getElementById('stickyHeader');
    const toggleSoundBtn = document.getElementById('toggleSound');


    // Sample Structure Buttons
    const loadShortBtn = document.getElementById('loadShort');
    const loadMediumBtn = document.getElementById('loadMedium');
    const loadLongBtn = document.getElementById('loadLong');
    
    // Tournament State
    let tournament = {
        name: 'Default Structure',
        rounds: [],
        currentRoundIndex: 0,
        isRunning: false,
        timeRemaining: 0,
        timer: null,
        lastUpdate: 0
    };
    
    let allStructures = [];
    let currentStructureId = null;

    let soundEnabled = true
    
    // Sample Structures
    const sampleStructures = {
        short: {
            name: "Short Tournament",
            rounds: [
                { duration: 15, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
                { duration: 15, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
                { duration: 15, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 15, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
                { duration: 15, smallBlind: 200, bigBlind: 400, ante: 50, isBreak: false }
            ]
        },
        medium: {
            name: "Medium Tournament",
            rounds: [
                { duration: 20, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
                { duration: 20, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
                { duration: 20, smallBlind: 75, bigBlind: 150, ante: 25, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 20, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
                { duration: 20, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
                { duration: 20, smallBlind: 200, bigBlind: 400, ante: 50, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 20, smallBlind: 300, bigBlind: 600, ante: 50, isBreak: false }
            ]
        },
        long: {
            name: "Long Tournament",
            rounds: [
                { duration: 30, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
                { duration: 30, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
                { duration: 30, smallBlind: 75, bigBlind: 150, ante: 0, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 30, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
                { duration: 30, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
                { duration: 30, smallBlind: 200, bigBlind: 400, ante: 25, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 30, smallBlind: 300, bigBlind: 600, ante: 50, isBreak: false },
                { duration: 30, smallBlind: 400, bigBlind: 800, ante: 50, isBreak: false },
                { duration: 30, smallBlind: 500, bigBlind: 1000, ante: 100, isBreak: false },
                { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
                { duration: 30, smallBlind: 600, bigBlind: 1200, ante: 100, isBreak: false }
            ]
        }
    };
    
    // Initialize the app
    init();
    
    function init() {
        loadFromLocalStorage();
        renderRoundsTable();
        updateClockDisplay();
        setupEventListeners();
        checkHeaderOnLoad();
        setupPageVisibilityHandler(); // Add this line
        setupSoundControls();
        setupMobileSoundUnlock();
        // setupRandomColorButton();
        loadHeaderColor();
        playVictoryFanfare();
        setupSpeech();

    // Clear any running state that might be left over
    localStorage.removeItem('pokerTournamentClockRunning');
    
    }

    function announceRoundDetails() {
        // Check if speech is supported and allowed
        if (!window.speechSynthesis || !soundEnabled) return;
        
        const currentRound = tournament.rounds[tournament.currentRoundIndex];
        const minutes = Math.floor(tournament.timeRemaining / 60);
        
        // Create the announcement text
        let announcement;
        if (currentRound.isBreak) {
            announcement = `Break time. ${minutes} minute${minutes !== 1 ? 's' : ''} remaining.`;
        } else {
            announcement = `Small blind: ${currentRound.smallBlind}. ` +
                          `  Big blind: ${currentRound.bigBlind}. ` +
                          (currentRound.ante > 0 ? `Antey: ${currentRound.ante}. ` : '') +
                         
                          `${minutes} minute${minutes !== 1 ? 's' : ''} remaining.` +
                          ` Good luck! Shuffle up and deal!`;
        }
        
        // Cancel any previous speech
        speechSynthesis.cancel();
        
        // Create and configure the utterance
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.volume = 1; // 0-1 scale
        utterance.rate = 0.9; // Slightly slower than normal
        utterance.pitch = 1; // Normal pitch
        
        // Select a pleasant voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoices = [
            'Google UK English Male',
            'Microsoft David - English (United States)',
            'Alex', // macOS
            'Google UK English Female'
        ];
        
        for (const voiceName of preferredVoices) {
            const voice = voices.find(v => v.name === voiceName);
            if (voice) {
                utterance.voice = voice;
                break;
            }
        }
        
        // Speak the announcement
        speechSynthesis.speak(utterance);
        
        // Handle errors gracefully
        utterance.onerror = (event) => {
            console.log('Speech error:', event.error);
        };
    }
    
    function setupSpeech() {
        // Some browsers need voices to be loaded first
        speechSynthesis.onvoiceschanged = () => {
            // Voices are now loaded
        };
        
        // Call this when rounds change
        announceRoundDetails();
    }

    function setRandomHeaderColor() {
        const header = document.getElementById('stickyHeader');
        const colors = [
            '#1a472a', // Dark green
            '#2c3e50', // Navy
            '#27ae60', // Emerald
            '#e74c3c', // Red
            '#3498db', // Blue
            '#9b59b6', // Purple
            '#16a085',  // Teal
            '#e67e22', // Carrot
            '#f1c40f', // Sunflower
            '#8e44ad', // Wisteria
            '#2980b9', // Peter River
            '#d35400', // Pumpkin
            '#2ecc71', // Nephritis
            '#e74c3c', // Pomegranate
            '#f39c12', // Orange

        ];
        
        // Get current color
        const currentColor = header.style.backgroundColor || 
                            getComputedStyle(header).backgroundColor;
        
        
        let newColor;
        do {
            newColor = colors[Math.floor(Math.random() * colors.length)];
        } while (newColor === currentColor);
        
        // Animate the transition
        header.style.transition = 'background-color 0.5s ease';
        header.style.backgroundColor = newColor;
        
        // Store the color in localStorage
        localStorage.setItem('headerColor', newColor);
    }
    
    
    function loadHeaderColor() {
        const savedColor = localStorage.getItem('headerColor');
        if (savedColor) {
            document.getElementById('stickyHeader').style.backgroundColor = savedColor;
        }
    }

    function setupMobileSoundUnlock() {
        const unlockAudio = () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
    }
    

    function checkHeaderOnLoad() {
        const header = document.getElementById('stickyHeader');
        if (window.scrollY <= 10) {
            header.classList.remove('collapsed');
        } else {
            header.classList.add('collapsed');
        }
    }

    function addMinute() {
        tournament.timeRemaining += 60;
        updateClockDisplay();
        saveToLocalStorage();
        playAdjustmentSound();
    }
    
    function subtractMinute() {
        // Don't allow negative time
        if (tournament.timeRemaining > 60) {
            tournament.timeRemaining -= 60;
            updateClockDisplay();
            saveToLocalStorage();
            playAdjustmentSound();
        } else {
            playRoundChangeSound(); // Play warning sound
        }
    }

    function toggleFullscreenHeader() {
        const header = document.getElementById('stickyHeader');
        const isFullscreen = header.classList.toggle('fullscreen');
        document.body.classList.toggle('header-fullscreen', isFullscreen);
        
        // Update clock display when entering fullscreen
        if (isFullscreen) updateClockDisplay();
        
        // Optional: Change icon based on state
        const icon = header.querySelector('.fullscreen-icon');
        if (icon) {
            icon.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        }
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
    
    function updateSoundButton() {
        if (soundEnabled) {
            toggleSoundBtn.classList.remove('muted');
            toggleSoundBtn.title = "Mute sounds";
        } else {
            toggleSoundBtn.classList.add('muted');
            toggleSoundBtn.title = "Unmute sounds";
        }
    }

    function playTestSound() {
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

    
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('pokerTournamentClock');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            allStructures = data.allStructures || [];
            currentStructureId = data.currentStructureId;
            
            // Find the current structure
            const currentStructure = allStructures.find(s => s.id === currentStructureId);
            
            if (currentStructure) {
                tournament = {
                    name: currentStructure.name,
                    rounds: currentStructure.rounds,
                    currentRoundIndex: data.currentRoundIndex || 0,
                    isRunning: false, // Always start paused on reload
                    timeRemaining: data.timeRemaining || (currentStructure.rounds[0]?.duration * 60 || 0),
                    timer: null,
                    lastUpdate: 0
                };
                
                // Don't calculate elapsed time - just use the saved time remaining
                structureNameEl.textContent = tournament.name;
                updateClockDisplay();
                renderRoundsTable();
                return; // Skip the rest of the function
            }
        }
        
        // Default structure if nothing saved
        tournament.rounds = [
            { duration: 20, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
            { duration: 20, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false }
        ];
        tournament.timeRemaining = tournament.rounds[0].duration * 60;
        saveToLocalStorage();
    }
    
    function saveToLocalStorage() {
        // When saving, always store the current state with isRunning = false
        const data = {
            allStructures,
            currentStructureId,
            currentRoundIndex: tournament.currentRoundIndex,
            isRunning: false, // Always save as paused
            timeRemaining: tournament.timeRemaining,
            lastUpdate: 0 // Reset this since we're pausing
        };
        
        localStorage.setItem('pokerTournamentClock', JSON.stringify(data));
        
        // Additional save when the timer is running
        if (tournament.isRunning) {
            const runningData = {
                ...data,
                isRunning: true,
                lastUpdate: Date.now()
            };
            localStorage.setItem('pokerTournamentClockRunning', JSON.stringify(runningData));
        } else {
            localStorage.removeItem('pokerTournamentClockRunning');
        }
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function setupEventListeners() {
        // Clock Controls
        playPauseBtn.addEventListener('click', toggleTimer);
        colorChangeBtn.addEventListener('click', setRandomHeaderColor);
        toggleFullscreenBtn.addEventListener('click', toggleFullscreenHeader);
        prevRoundBtn.addEventListener('click', prevRound);
        nextRoundBtn.addEventListener('click', nextRound);
        resetRoundBtn.addEventListener('click', resetRound);
        addBreakBtn.addEventListener('click', addBreak);
        manageStructureBtn.addEventListener('click', openModal);
        
        // Modal Controls
        closeBtn.addEventListener('click', closeModal);
        saveStructureBtn.addEventListener('click', saveStructure);
        newStructureBtn.addEventListener('click', newStructure);
        importCSVBtn.addEventListener('click', importCSV);
        exportCSVBtn.addEventListener('click', exportCSV);
        addRoundBtn.addEventListener('click', addNewRound);
        
        // Sample Structures
        loadShortBtn.addEventListener('click', () => loadSampleStructure('short'));
        loadMediumBtn.addEventListener('click', () => loadSampleStructure('medium'));
        loadLongBtn.addEventListener('click', () => loadSampleStructure('long'));

        document.getElementById('addMinute').addEventListener('click', addMinute);
        document.getElementById('subtractMinute').addEventListener('click', subtractMinute);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    function loadSampleStructure(type) {
        if (confirm(`Load ${type} sample structure? This will replace your current structure.`)) {
            const sample = sampleStructures[type];
            const newStructure = {
                id: generateId(),
                name: sample.name,
                rounds: JSON.parse(JSON.stringify(sample.rounds))
            };
            
            // Add to saved structures if not already there
            if (!allStructures.some(s => s.name === sample.name)) {
                allStructures.push(newStructure);
            }
            
            // Set as current
            currentStructureId = newStructure.id;
            tournament = {
                name: newStructure.name,
                rounds: newStructure.rounds,
                currentRoundIndex: 0,
                isRunning: false,
                timeRemaining: newStructure.rounds[0].duration * 60,
                timer: null,
                lastUpdate: 0
            };
            
            structureNameEl.textContent = tournament.name;
            renderRoundsTable();
            updateClockDisplay();
            saveToLocalStorage();
            renderSavedStructuresList();
            closeModal();
        }
    }

    function setupPageVisibilityHandler() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is being hidden - save state
                saveToLocalStorage();
            }
        });
        
        // Handle beforeunload to ensure we save when closing
        window.addEventListener('beforeunload', () => {
            saveToLocalStorage();
        });
    }
    
    function renderSavedStructuresList() {
        savedStructuresList.innerHTML = '';
        
        allStructures.forEach(structure => {
            const item = document.createElement('div');
            item.className = `structure-item ${structure.id === currentStructureId ? 'active' : ''}`;
            
            item.innerHTML = `
                <span>${structure.name} (${structure.rounds.length} rounds)</span>
                <div class="structure-actions">
                    <button class="btn-load" data-id="${structure.id}"><i class="fas fa-play"></i></button>
                    <button class="btn-edit" data-id="${structure.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-id="${structure.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            savedStructuresList.appendChild(item);
        });
        
        // Add event listeners for structure actions
        document.querySelectorAll('.btn-load').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                loadStructure(id);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editStructure(id);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteStructure(id);
            });
        });
    }
    
    function loadStructure(id) {
        const structure = allStructures.find(s => s.id === id);
        if (!structure) return;
        
        currentStructureId = id;
        tournament = {
            name: structure.name,
            rounds: structure.rounds,
            currentRoundIndex: 0,
            isRunning: false,
            timeRemaining: structure.rounds[0].duration * 60,
            timer: null,
            lastUpdate: 0
        };
        
        structureNameEl.textContent = tournament.name;
        renderRoundsTable();
        updateClockDisplay();
        saveToLocalStorage();
        renderSavedStructuresList();
        closeModal();
    }
    
    function editStructure(id) {
        const structure = allStructures.find(s => s.id === id);
        if (!structure) return;
        
        structureNameInput.value = structure.name;
        csvDataEl.value = generateCSV(structure.rounds);
        
        // Show save button for this structure
        saveStructureBtn.setAttribute('data-id', id);
        
        // Hide other controls temporarily
        document.querySelectorAll('.modal-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show only the relevant sections
        document.querySelector('.modal-section h3').parentElement.style.display = 'block';
        document.querySelector('.modal-section h3').textContent = `Editing: ${structure.name}`;
        document.querySelector('.modal-section:nth-child(2)').style.display = 'block';
    }
    
    function deleteStructure(id) {
        if (allStructures.length <= 1) {
            alert("You can't delete the last remaining structure.");
            return;
        }
        
        if (confirm("Are you sure you want to delete this structure?")) {
            allStructures = allStructures.filter(s => s.id !== id);
            
            // If deleting current structure, load another one
            if (id === currentStructureId) {
                currentStructureId = allStructures[0].id;
                loadStructure(currentStructureId);
            }
            
            saveToLocalStorage();
            renderSavedStructuresList();
        }
    }
    
    function toggleTimer() {
        if (tournament.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    function startTimer() {
        if (tournament.timer) clearInterval(tournament.timer);
        
        tournament.isRunning = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseBtn.classList.add('play');
        playAdjustmentSound();
        tournament.timer = setInterval(function() {
            tournament.timeRemaining--;
            updateClockDisplay();
            saveToLocalStorage();
            
            if (tournament.timeRemaining <= 0) {
                nextRound();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        clearInterval(tournament.timer);
        tournament.timer = null;
        tournament.isRunning = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playPauseBtn.classList.remove('play');
        saveToLocalStorage();
        playAdjustmentSound();
    }
    
    function prevRound() {
        if (tournament.currentRoundIndex > 0) {
            tournament.currentRoundIndex--;
            playRoundChangeSound();
            resetRound();
            announceRoundDetails();
            setRandomHeaderColor();
            renderRoundsTable(); // Ensure highlighting updates
        }
    }
    
    function nextRound() {
        if (tournament.currentRoundIndex < tournament.rounds.length - 1) {
            tournament.currentRoundIndex++;
            playMelodiousAlert();
            setRandomHeaderColor();
            resetRound();
            renderRoundsTable(); // Ensure highlighting updates
            //if this is a break, play a sound
            if (tournament.rounds[tournament.currentRoundIndex].isBreak) {
                playBreakSound();
            }
            announceRoundDetails(); 
        } else {
            // End of tournament
            // playRoundChangeSound();
            playVictoryFanfare();
            pauseTimer();
            alert('Tournament structure completed!');
        }
    }
    
    function resetRound() {
        const currentRound = tournament.rounds[tournament.currentRoundIndex];
        tournament.timeRemaining = currentRound.duration * 60;
        announceRoundDetails();
        if (tournament.isRunning) {
            pauseTimer();
            startTimer();
        } else {
            updateClockDisplay();
        }
        
        renderRoundsTable(); // Ensure highlighting updates
        saveToLocalStorage();
    }
    
    function addBreak() {
        const breakRound = {
            duration: 10,
            smallBlind: 0,
            bigBlind: 0,
            ante: 0,
            isBreak: true
        };
        
        // Insert break after current round
        tournament.rounds.splice(tournament.currentRoundIndex + 1, 0, breakRound);
        
        // Update current structure
        const currentStructure = allStructures.find(s => s.id === currentStructureId);
        if (currentStructure) {
            currentStructure.rounds = tournament.rounds;
        }
        
        renderRoundsTable();
        saveToLocalStorage();
    }
    
    function updateClockDisplay() {
        const currentRound = tournament.rounds[tournament.currentRoundIndex];
        const minutes = Math.floor(tournament.timeRemaining / 60);
        const seconds = tournament.timeRemaining % 60;
        const timeEl = document.getElementById('timeRemaining');
        
        // Update time display
        timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Handle critical time (last minute)
        if(tournament.timeRemaining === 60) {
            playMelodiousAlert();
            timeEl.classList.add('one-minute');
        }
        if(tournament.timeRemaining === 30) {
            playMelodiousAlert();
        }
        if (tournament.timeRemaining <= 60 && tournament.timeRemaining > 10) {
            timeEl.classList.add('one-minute');
        }else{
            timeEl.classList.remove('one-minute');
        }
        //last ten seconds
        if (tournament.timeRemaining <= 10) {
            timeEl.classList.add('time-critical');
            
            // Play warning beep every second if sound is enabled
            if (soundEnabled && tournament.isRunning && seconds % 2 === 0) {
                playWarningSound();
            }
        } else {
            timeEl.classList.remove('time-critical');
        }
        
        // Rest of your existing display updates...
        roundNumberEl.textContent = `Round ${tournament.currentRoundIndex + 1}`;
        
        if (currentRound.isBreak) {
            blindsDisplayEl.textContent = 'BREAK';
            anteDisplayEl.textContent = '';
        } else {
            blindsDisplayEl.textContent = `${currentRound.smallBlind} / ${currentRound.bigBlind}`;
            anteDisplayEl.textContent = currentRound.ante > 0 ? `Ante: ${currentRound.ante}` : '';
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
    
    function renderRoundsTable() {
        roundsListEl.innerHTML = '';
        
        tournament.rounds.forEach((round, index) => {
            const row = document.createElement('tr');
            
            // Highlight current round
            if (index === tournament.currentRoundIndex) {
                row.classList.add('current-round');
            }
            
            if (round.isBreak) {
                row.classList.add('break-round');
            }
            
            row.innerHTML = `
                <td class="editable" data-index="${index}" data-field="roundNumber">${index + 1}</td>
                <td class="editable" data-index="${index}" data-field="duration">${round.duration}</td>
                <td class="editable" data-index="${index}" data-field="smallBlind">${round.isBreak ? '-' : round.smallBlind}</td>
                <td class="editable" data-index="${index}" data-field="bigBlind">${round.isBreak ? '-' : round.bigBlind}</td>
                <td class="editable" data-index="${index}" data-field="ante">${round.isBreak ? '-' : round.ante}</td>
                <td>${round.isBreak ? 'Break' : 'Playing'}</td>
            `;
            
            roundsListEl.appendChild(row);
        });
        
        // Add click handlers for editable cells
        document.querySelectorAll('.editable').forEach(cell => {
            cell.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const field = this.getAttribute('data-field');
                const currentValue = tournament.rounds[index][field];
                
                if (field === 'roundNumber') return; // Can't edit round number
                
                if (tournament.rounds[index].isBreak && (field === 'smallBlind' || field === 'bigBlind' || field === 'ante')) {
                    return; // Can't edit blinds/ante during break
                }
                
                const newValue = prompt(`Enter new value for ${field}:`, currentValue);
                
                if (newValue !== null && !isNaN(newValue)) {
                    const numValue = parseInt(newValue);
                    if (!isNaN(numValue)) {
                        tournament.rounds[index][field] = field === 'duration' ? numValue : numValue;
                        
                        // Update current structure
                        const currentStructure = allStructures.find(s => s.id === currentStructureId);
                        if (currentStructure) {
                            currentStructure.rounds = tournament.rounds;
                        }
                        
                        // If editing current round's duration, update time remaining
                        if (index === tournament.currentRoundIndex && field === 'duration') {
                            tournament.timeRemaining = tournament.rounds[index].duration * 60;
                            updateClockDisplay();
                        }
                        
                        renderRoundsTable();
                        saveToLocalStorage();
                    }
                }
            });
        });
    }
    
    // Modal Functions
    function openModal() {
        document.body.classList.add('modal-open');
        modal.style.display = 'block';
        structureNameInput.value = tournament.name;
        csvDataEl.value = generateCSV(tournament.rounds);
        renderSavedStructuresList();
        
        // Reset save button
        saveStructureBtn.removeAttribute('data-id');
        
        // Show all sections
        document.querySelectorAll('.modal-section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Reset header text
        document.querySelector('.modal-section h3').textContent = 'Current Structure';
    }
    
    function closeModal() {
        document.body.classList.remove('modal-open');
        modal.style.display = 'none';
    }
    
    function saveStructure() {
        const structureId = saveStructureBtn.getAttribute('data-id');
        
        if (structureId) {
            // Editing existing structure
            const structure = allStructures.find(s => s.id === structureId);
            if (structure) {
                structure.name = structureNameInput.value;
                
                // If this is the current structure, update the tournament
                if (structureId === currentStructureId) {
                    tournament.name = structure.name;
                    structureNameEl.textContent = tournament.name;
                }
            }
        } else {
            // Saving current structure
            const newStructure = {
                id: generateId(),
                name: structureNameInput.value,
                rounds: JSON.parse(JSON.stringify(tournament.rounds))
            };
            
            allStructures.push(newStructure);
            currentStructureId = newStructure.id;
            tournament.name = newStructure.name;
            structureNameEl.textContent = tournament.name;
        }
        
        saveToLocalStorage();
        renderSavedStructuresList();
        closeModal();
    }
    
    function newStructure() {
        if (confirm('Create a new empty structure?')) {
            const newStructure = {
                id: generateId(),
                name: 'New Structure ' + (allStructures.length + 1),
                rounds: []
            };
            
            allStructures.push(newStructure);
            currentStructureId = newStructure.id;
            tournament = {
                name: newStructure.name,
                rounds: newStructure.rounds,
                currentRoundIndex: 0,
                isRunning: false,
                timeRemaining: 0,
                timer: null,
                lastUpdate: 0
            };
            
            structureNameEl.textContent = tournament.name;
            renderRoundsTable();
            updateClockDisplay();
            saveToLocalStorage();
            renderSavedStructuresList();
        }
    }
    
    function addNewRound() {
        const round = {
            duration: parseInt(newRoundDuration.value),
            smallBlind: parseInt(newSmallBlind.value),
            bigBlind: parseInt(newBigBlind.value),
            ante: parseInt(newAnte.value),
            isBreak: newIsBreak.checked
        };
        
        tournament.rounds.push(round);
        
        // Update current structure
        const currentStructure = allStructures.find(s => s.id === currentStructureId);
        if (currentStructure) {
            currentStructure.rounds = tournament.rounds;
        }
        
        // If this is the first round, set it as current
        if (tournament.rounds.length === 1) {
            tournament.currentRoundIndex = 0;
            tournament.timeRemaining = round.duration * 60;
            updateClockDisplay();
        }
        
        renderRoundsTable();
        saveToLocalStorage();
        
        // Reset form
        newRoundDuration.value = 20;
        newSmallBlind.value = 25;
        newBigBlind.value = 50;
        newAnte.value = 0;
        newIsBreak.checked = false;
    }
    
    function generateCSV(rounds) {
        rounds = rounds || tournament.rounds;
        let csv = 'Duration,Small Blind,Big Blind,Ante,Is Break\n';
        
        rounds.forEach(round => {
            csv += `${round.duration},${round.smallBlind},${round.bigBlind},${round.ante},${round.isBreak}\n`;
        });
        
        return csv;
    }
    
    function importCSV() {
        const csv = csvDataEl.value.trim();
        const lines = csv.split('\n');
        const newRounds = [];
        
        // Skip header line if present
        const startLine = lines[0].includes('Duration') ? 1 : 0;
        
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [duration, smallBlind, bigBlind, ante, isBreak] = line.split(',');
                
                newRounds.push({
                    duration: parseInt(duration),
                    smallBlind: parseInt(smallBlind),
                    bigBlind: parseInt(bigBlind),
                    ante: parseInt(ante),
                    isBreak: isBreak ? isBreak.toLowerCase() === 'true' : false
                });
            }
        }
        
        if (newRounds.length > 0) {
            tournament.rounds = newRounds;
            tournament.currentRoundIndex = 0;
            tournament.timeRemaining = tournament.rounds[0].duration * 60;
            tournament.isRunning = false;
            
            // Update current structure
            const currentStructure = allStructures.find(s => s.id === currentStructureId);
            if (currentStructure) {
                currentStructure.rounds = tournament.rounds;
            }
            
            renderRoundsTable();
            updateClockDisplay();
            saveToLocalStorage();
            renderSavedStructuresList();
            
            alert(`Successfully imported ${newRounds.length} rounds.`);
        } else {
            alert('No valid rounds found in CSV data.');
        }
    }
    
    function exportCSV() {
        csvDataEl.value = generateCSV();
    }
});