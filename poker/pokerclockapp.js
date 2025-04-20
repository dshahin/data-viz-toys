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
    
    
    
    // Initialize the app
    init();
    
    function init() {
        loadFromLocalStorage();
        setupSpeech();
        renderRoundsTable();
        updateClockDisplay();
        setupEventListeners();
        setupPageVisibilityHandler(); // Add this line
        setupSoundControls();
        setupMobileSoundUnlock();
        loadHeaderColor();
        playVictoryFanfare();
        

    // Clear any running state that might be left over
        localStorage.removeItem('pokerTournamentClockRunning');
    
    }

    function announceRoundDetails() {
        // Check if speech is supported and allowed
        if (!window.speechSynthesis || !soundEnabled) return;
        
        const currentRound = tournament.rounds[tournament.currentRoundIndex];
        const minutes = Math.floor(tournament.timeRemaining / 60); 
        const seconds = tournament.timeRemaining % 60;
        
        // Create the announcement text
        let announcement;
        if (currentRound.isBreak) {
            announcement = `Break time. ${minutes} minute${minutes !== 1 ? 's' : ''} remaining.`;
        } else {
            //say the round number
            announcement = `Round ${tournament.currentRoundIndex + 1}. ` +
                          `Small blind: ${currentRound.smallBlind}. ` +
                          `  Big blind: ${currentRound.bigBlind}. ` +
                          (currentRound.ante > 0 ? `Antey: ${currentRound.ante}. ` : '') +
                         
                          `${minutes} minute${minutes !== 1 ? 's' : ''} remaining.` +
                          ` Good luck! Shuffle up and deal!`;
        }
        
        TextToSpeech.speak(announcement);
    }
    
    function setupSpeech() {
        // Some browsers need voices to be loaded first
        speechSynthesis.onvoiceschanged = () => {
            // Voices are now loaded
        };
        
        // Call this when rounds change
        soundEnabled = true;
                    
    }

    function setRandomHeaderColor() {
        const header = document.getElementById('stickyHeader');
        
        // Get current color
        const currentColor = header.style.backgroundColor || 
                            getComputedStyle(header).backgroundColor;
        // Generate a contrasting color
        let newColor = generateContrastingColor(currentColor);
        // Animate the transition
        header.style.transition = 'background-color 0.5s ease';
        header.style.backgroundColor = newColor;
        
        // Store the color in localStorage
        localStorage.setItem('headerColor', newColor);
        playWindChime();
    }
    
    
    function loadHeaderColor() {
        const savedColor = localStorage.getItem('headerColor');
        if (savedColor) {
            document.getElementById('stickyHeader').style.backgroundColor = savedColor;
        }else{
            document.getElementById('stickyHeader').style.backgroundColor = generateContrastingColor(null);
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

        playBoingSound();
        
        // Optional: Change icon based on state
        const icon = header.querySelector('.fullscreen-icon');
        if (icon) {
            icon.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        }
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
            //speak
            TextToSpeech.speak('Clock paused');
        } else {
            startTimer();
            //speak
            TextToSpeech.speak('Clock started');
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
            playRoundChangeSound();
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
        // announceRoundDetails();
        //speak
        TextToSpeech.speak(`Round ${tournament.currentRoundIndex + 1} reset to ${currentRound.duration} minutes`);
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
        //set the document title to the current time left
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Handle critical time (last minute)
        if(tournament.timeRemaining === 60) {
            playMelodiousAlert();
            timeEl.classList.add('one-minute');
            TextToSpeech.speak('one minute remaining');
        }
        if(tournament.timeRemaining === 30) {
            playMelodiousAlert();
            TextToSpeech.speak('Thirty seconds');
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
            if (soundEnabled && tournament.isRunning ) {
                playWarningSound();
                TextToSpeech.speak(`${seconds}`);
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