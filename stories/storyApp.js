class StoryManager {
    constructor() {
        this.currentStory = JSON.parse(JSON.stringify(sampleStory));
        this.library = JSON.parse(localStorage.getItem('storyLibrary')) || [];
        this.editMode = false;
        this.editingPhase = 1;
    }

    cancelEdit() {
        this.toggleEditMode();
    }

    loadStory(story) {
        this.currentStory = JSON.parse(JSON.stringify(story));
        this.updateDisplay();
        this.saveToLibrary();
    }

    updateDisplay() {
        const phase = this.currentStory.phases[this.currentStory.currentPhase];
        document.getElementById('storyTitle').textContent = this.currentStory.title;
        
        const storyContent = document.getElementById('storyContent');
        storyContent.className = 'story-content';
        storyContent.innerHTML = `<h3>${phase.title}</h3><p>${phase.content}</p>`;
        
        if (phase.type === "success") {
            storyContent.classList.add('success-node');
            storyContent.innerHTML += `<div class="end-message success-message">SUCCESS! You completed the story!</div>`;
        } else if (phase.type === "failure") {
            storyContent.classList.add('failure-node');
            storyContent.innerHTML += `<div class="end-message failure-message">FAILURE! The story ends here...</div>`;
        }

        const choicesContainer = document.getElementById('choicesContainer');
        choicesContainer.innerHTML = '';
        
        if (phase.choices && phase.choices.length > 0) {
            phase.choices.forEach((choice) => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.addEventListener('click', () => {
                    this.currentStory.currentPhase = choice.nextPhase;
                    this.updateDisplay();
                });
                choicesContainer.appendChild(button);
            });
        } else {
            const restartButton = document.createElement('button');
            restartButton.textContent = "Play Again";
            restartButton.addEventListener('click', () => {
                this.currentStory.currentPhase = 1;
                this.updateDisplay();
            });
            choicesContainer.appendChild(restartButton);
        }
    }

    newStory() {
        if (confirm("Create a new story? Your current story will be saved to the library.")) {
            this.saveToLibrary();
            this.currentStory = {
                title: "Untitled Story",
                currentPhase: 1,
                phases: {
                    1: {
                        title: "Beginning",
                        content: "This is where your story begins.",
                        choices: [],
                        type: "normal"
                    }
                }
            };
            this.updateDisplay();
            this.updatePhaseList();
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        
        if (this.editMode) {
            this.editingPhase = this.currentStory.currentPhase;
            document.getElementById('editStoryTitle').value = this.currentStory.title;
            this.loadPhaseForEditing(this.editingPhase);
            document.getElementById('editorPanel').style.display = 'block';
            document.getElementById('storyDisplay').style.display = 'none';
            this.updatePhaseList();
        } else {
            document.getElementById('editorPanel').style.display = 'none';
            document.getElementById('storyDisplay').style.display = 'block';
        }
    }

    loadPhaseForEditing(phaseNumber) {
        const phase = this.currentStory.phases[phaseNumber];
        document.getElementById('currentPhaseDisplay').textContent = `Node: ${phase.title}`;
        document.getElementById('editingNodeId').textContent = phaseNumber;
        document.getElementById('editNodeTitle').value = phase.title;
        document.getElementById('nodeTypeSelect').value = phase.type || "normal";
        document.getElementById('editContent').value = phase.content;
        
        const choiceInputs = document.getElementById('choiceInputs');
        choiceInputs.innerHTML = '';
        if (phase.choices && phase.choices.length > 0) {
            phase.choices.forEach((choice) => {
                this.addChoiceInput(choice.text, choice.nextPhase);
            });
        }
    }

    addChoiceInput(text = '', nextPhase = '') {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice-input';
        choiceDiv.innerHTML = `
            <input type="text" class="choice-text" placeholder="Choice text" value="${text}">
            <input type="number" class="choice-next" placeholder="Next node ID" value="${nextPhase}">
            <button class="remove-choice">×</button>
        `;
        choiceDiv.querySelector('.remove-choice').addEventListener('click', () => {
            choiceDiv.remove();
        });
        document.getElementById('choiceInputs').appendChild(choiceDiv);
    }

    saveEdit() {
        const phase = this.currentStory.phases[this.editingPhase];
        
        if (this.editingPhase === 1) {
            this.currentStory.title = document.getElementById('editStoryTitle').value;
        }
        
        phase.title = document.getElementById('editNodeTitle').value;
        phase.content = document.getElementById('editContent').value;
        phase.type = document.getElementById('nodeTypeSelect').value;
        
        phase.choices = [];
        if (phase.type === "normal") {
            document.querySelectorAll('.choice-input').forEach(inputDiv => {
                const text = inputDiv.querySelector('.choice-text').value;
                const nextPhase = parseInt(inputDiv.querySelector('.choice-next').value);
                if (text && !isNaN(nextPhase)) {
                    phase.choices.push({
                        text: text,
                        nextPhase: nextPhase
                    });
                    
                    if (!this.currentStory.phases[nextPhase]) {
                        this.currentStory.phases[nextPhase] = {
                            title: `Node ${nextPhase}`,
                            content: '',
                            choices: [],
                            type: "normal"
                        };
                    }
                }
            });
        }

        this.saveToLibrary();
        this.toggleEditMode();
        this.updateDisplay();
        this.updatePhaseList();
    }

    navigatePhase(direction) {
        if (!this.editMode) return;
        
        const phases = Object.keys(this.currentStory.phases).map(Number).sort((a, b) => a - b);
        const currentIndex = phases.indexOf(this.editingPhase);
        let newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < phases.length) {
            this.editingPhase = phases[newIndex];
            this.loadPhaseForEditing(this.editingPhase);
            this.highlightCurrentPhaseInList();
        }
    }

    addNewPhase() {
        if (!this.editMode) return;
        
        const phases = Object.keys(this.currentStory.phases).map(Number);
        const newPhaseNum = phases.length > 0 ? Math.max(...phases) + 1 : 1;
        
        this.currentStory.phases[newPhaseNum] = {
            title: `Node ${newPhaseNum}`,
            content: '',
            choices: [],
            type: "normal"
        };
        
        this.editingPhase = newPhaseNum;
        this.loadPhaseForEditing(newPhaseNum);
        this.updatePhaseList();
    }

    updatePhaseList() {
        const phaseListItems = document.getElementById('phaseListItems');
        phaseListItems.innerHTML = '';
        
        const phases = Object.keys(this.currentStory.phases).map(Number).sort((a, b) => a - b);
        
        phases.forEach(phaseNum => {
            const phase = this.currentStory.phases[phaseNum];
            const item = document.createElement('div');
            item.className = 'phase-list-item';
            if (phaseNum === this.editingPhase) {
                item.classList.add('active');
            }
            
            let typeIndicator = '';
            if (phase.type === "success") typeIndicator = "✓ ";
            else if (phase.type === "failure") typeIndicator = "✗ ";
            
            item.textContent = `${typeIndicator}Node ${phaseNum}: ${phase.title}`;
            item.addEventListener('click', () => {
                this.editingPhase = phaseNum;
                this.loadPhaseForEditing(phaseNum);
                this.highlightCurrentPhaseInList();
            });
            
            phaseListItems.appendChild(item);
        });
    }

    highlightCurrentPhaseInList() {
        document.querySelectorAll('.phase-list-item').forEach(item => {
            item.classList.remove('active');
            const phaseNum = parseInt(item.textContent.match(/Node (\d+)/)[1]);
            if (phaseNum === this.editingPhase) {
                item.classList.add('active');
            }
        });
    }

    exportStory() {
        const dataStr = JSON.stringify(this.currentStory, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${this.currentStory.title.replace(/\s+/g, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importStory(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedStory = JSON.parse(e.target.result);
                this.loadStory(importedStory);
                event.target.value = '';
            } catch (error) {
                alert("Error importing story: " + error.message);
            }
        };
        reader.readAsText(file);
    }

    saveToLibrary() {
        const existingIndex = this.library.findIndex(item => item.title === this.currentStory.title);
        
        if (existingIndex >= 0) {
            this.library[existingIndex] = JSON.parse(JSON.stringify(this.currentStory));
        } else {
            this.library.push(JSON.parse(JSON.stringify(this.currentStory)));
        }
        
        localStorage.setItem('storyLibrary', JSON.stringify(this.library));
        this.updateLibraryList();
    }

    updateLibraryList() {
        const libraryList = document.getElementById('libraryList');
        libraryList.innerHTML = '';
        
        if (this.library.length === 0) {
            libraryList.innerHTML = '<p>No stories in library yet.</p>';
            return;
        }
        
        this.library.forEach((story) => {
            const item = document.createElement('div');
            item.className = 'library-item';
            if (story.title === this.currentStory.title) {
                item.classList.add('active-story');
            }
            item.textContent = story.title;
            item.addEventListener('click', () => {
                this.loadStory(story);
            });
            
            libraryList.appendChild(item);
        });
    }
}

// Initialize the app
const storyManager = new StoryManager();

// DOM elements
const newStoryBtn = document.getElementById('newStoryBtn');
const editStoryBtn = document.getElementById('editStoryBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const addChoiceBtn = document.getElementById('addChoiceBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const prevPhaseBtn = document.getElementById('prevPhaseBtn');
const nextPhaseBtn = document.getElementById('nextPhaseBtn');
const addPhaseBtn = document.getElementById('addPhaseBtn');

// Event listeners
newStoryBtn.addEventListener('click', () => storyManager.newStory());
editStoryBtn.addEventListener('click', () => storyManager.toggleEditMode());
exportBtn.addEventListener('click', () => storyManager.exportStory());
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => storyManager.importStory(e));
addChoiceBtn.addEventListener('click', () => storyManager.addChoiceInput());
saveEditBtn.addEventListener('click', () => storyManager.saveEdit());
cancelEditBtn.addEventListener('click', () => storyManager.cancelEdit());
prevPhaseBtn.addEventListener('click', () => storyManager.navigatePhase(-1));
nextPhaseBtn.addEventListener('click', () => storyManager.navigatePhase(1));
addPhaseBtn.addEventListener('click', () => storyManager.addNewPhase());

// Initialize display
storyManager.updateDisplay();