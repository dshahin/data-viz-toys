// pokerclock.js - Complete Texas Hold'em Tournament Clock

// DOM Elements
const clockDisplay = document.getElementById('clock');
const currentLevelDisplay = document.getElementById('current-level');
const blindsDisplay = document.getElementById('blinds-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const structureBody = document.getElementById('structure-body');
const levelTypeSelect = document.getElementById('level-type');
const blindFields = document.getElementById('blind-fields');
const smallBlindInput = document.getElementById('small-blind');
const bigBlindInput = document.getElementById('big-blind');
const anteInput = document.getElementById('ante');
const durationInput = document.getElementById('duration');
const addLevelBtn = document.getElementById('add-level-btn');
const removeLevelBtn = document.getElementById('remove-level-btn');
const structureSelect = document.getElementById('structure-select');
const newStructureNameInput = document.getElementById('new-structure-name');
const newStructureBtn = document.getElementById('new-structure-btn');
const saveStructureBtn = document.getElementById('save-structure-btn');
const deleteStructureBtn = document.getElementById('delete-structure-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const importCsvBtn = document.getElementById('import-csv-btn');
const csvModal = document.getElementById('csv-modal');
const modalTitle = document.getElementById('modal-title');
const csvTextarea = document.getElementById('csv-textarea');
const modalActionBtn = document.getElementById('modal-action-btn');
const closeModal = document.getElementsByClassName('close')[0];

// Tournament State
const tournament = {
    structures: {},
    currentStructure: '',
    levels: [],
    currentLevel: 0,
    isRunning: false,
    timer: null,
    timeRemaining: 0,
    totalSeconds: 0,
    editingCell: null,
    lastUpdate: Date.now(),
    selectedLevel: -1,
    lastSavedTime: 0
};

// Initialize Application
function init() {
    loadAllData();
    setupEventListeners();
    toggleLevelTypeFields();
    
    if (Object.keys(tournament.structures).length === 0) {
        createSampleStructures();
    } else {
        restoreTournamentState();
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// Timer Functions
function pauseTimer() {
    if (!tournament.isRunning) return;
    
    clearInterval(tournament.timer);
    tournament.isRunning = false;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    saveAllData();
}

function startTimer() {
    if (tournament.isRunning || tournament.levels.length === 0) return;
    
    tournament.isRunning = true;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    
    if (tournament.timeRemaining === 0) {
        tournament.totalSeconds = tournament.levels[tournament.currentLevel].duration * 60;
        tournament.timeRemaining = tournament.totalSeconds;
    }
    
    tournament.lastUpdate = Date.now();
    tournament.timer = setInterval(updateTimer, 1000);
    saveAllData();
}

function updateTimer() {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - tournament.lastUpdate) / 1000);
    tournament.lastUpdate = now;
    
    tournament.timeRemaining = Math.max(0, tournament.timeRemaining - elapsedSeconds);
    updateClockDisplay();
    
    // Save state every second while timer is running
    if (now - tournament.lastSavedTime > 1000) {
        saveAllData();
        tournament.lastSavedTime = now;
    }
    
    if (tournament.timeRemaining <= 0) {
        nextLevel();
    }
}

function resetTimer() {
    pauseTimer();
    tournament.currentLevel = 0;
    tournament.timeRemaining = 0;
    updateClockDisplay();
    updateDisplay();
    saveAllData();
}

function toggleTimer() {
    tournament.isRunning ? pauseTimer() : startTimer();
}

// Level Navigation
function goToLevel(index) {
    if (index < 0 || index >= tournament.levels.length) return;
    
    pauseTimer();
    tournament.currentLevel = index;
    tournament.timeRemaining = tournament.levels[index].duration * 60;
    tournament.selectedLevel = -1;
    
    updateDisplay();
    renderStructure(); // This fixes the highlight issue
    saveAllData();
}

function nextLevel() {
    if (tournament.levels.length === 0) return;
    const nextIndex = (tournament.currentLevel + 1) % tournament.levels.length;
    goToLevel(nextIndex);
}

function prevLevel() {
    if (tournament.levels.length === 0) return;
    const prevIndex = (tournament.currentLevel - 1 + tournament.levels.length) % tournament.levels.length;
    goToLevel(prevIndex);
}

// [Rest of the functions remain exactly the same as in the previous working version]

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);