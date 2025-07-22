class IntergalacticMemory {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        this.timer = 0;
        this.timerInterval = null;
        this.currentMode = 16;
        
        this.spaceIcons16 = [
            'planet', 'rocket', 'star', 'ufo', 
            'galaxy', 'asteroid', 'comet', 'astronaut'
        ];
        
        this.spaceIcons36 = [
            'planet', 'rocket', 'star', 'ufo', 
            'galaxy', 'asteroid', 'comet', 'astronaut',
            'satellite', 'blackhole', 'nebula', 'meteor',
            'spacestation', 'wormhole', 'pulsar', 'supernova',
            'quasar', 'satellite'
        ];
        
        this.gameBoard = document.getElementById('gameBoard');
        this.timerDisplay = document.getElementById('timer');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameComplete = document.getElementById('gameComplete');
        this.finalTime = document.getElementById('finalTime');
        this.modeSelection = document.getElementById('modeSelection');
        this.gameContainer = document.getElementById('gameContainer');
        
        this.loadScores();
        this.displayScores();
        this.setupEventListeners();
    }
    
    startGame(mode) {
        this.currentMode = mode;
        this.modeSelection.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.initializeGame();
    }
    
    initializeGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.resetTimer();
        this.gameStarted = false;
        this.gameEnded = false;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
    }
    
    createCards() {
        this.cards = [];
        const icons = this.currentMode === 16 ? this.spaceIcons16 : this.spaceIcons36;
        const pairsNeeded = this.currentMode / 2;
        
        // Create pairs of cards
        for (let i = 0; i < pairsNeeded; i++) {
            this.cards.push({
                id: i * 2,
                icon: icons[i],
                matched: false,
                flipped: false
            });
            this.cards.push({
                id: i * 2 + 1,
                icon: icons[i],
                matched: false,
                flipped: false
            });
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderCards() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${this.currentMode === 16 ? 'grid-4x4' : 'grid-6x6'}`;
        
        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }
    
    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.index = index;
        
        cardDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <div class="icon-${card.icon}"></div>
                </div>
            </div>
        `;
        
        cardDiv.addEventListener('click', () => this.handleCardClick(index));
        
        return cardDiv;
    }
    
    handleCardClick(index) {
        if (this.gameEnded) return;
        
        const card = this.cards[index];
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        
        // Prevent clicking on already flipped or matched cards
        if (card.flipped || card.matched) return;
        
        // Prevent clicking on more than 2 cards
        if (this.flippedCards.length >= 2) return;
        
        // Start timer on first card click
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }
        
        // Flip the card
        this.flipCard(index, cardElement);
        
        // Check for matches when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            setTimeout(() => this.checkForMatch(), 1000);
        }
    }
    
    flipCard(index, cardElement) {
        const card = this.cards[index];
        card.flipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
    }
    
    checkForMatch() {
        const [firstIndex, secondIndex] = this.flippedCards;
        const firstCard = this.cards[firstIndex];
        const secondCard = this.cards[secondIndex];
        
        const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
        const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
        
        if (firstCard.icon === secondCard.icon) {
            // Match found!
            this.handleMatch(firstIndex, secondIndex, firstElement, secondElement);
        } else {
            // No match, flip cards back
            this.handleNoMatch(firstIndex, secondIndex, firstElement, secondElement);
        }
        
        this.flippedCards = [];
    }
    
    handleMatch(firstIndex, secondIndex, firstElement, secondElement) {
        this.cards[firstIndex].matched = true;
        this.cards[secondIndex].matched = true;
        
        firstElement.classList.add('matched');
        secondElement.classList.add('matched');
        
        this.matchedPairs++;
        
        // Check if game is complete
        if (this.matchedPairs === this.currentMode / 2) {
            setTimeout(() => this.gameCompleted(), 500);
        }
    }
    
    handleNoMatch(firstIndex, secondIndex, firstElement, secondElement) {
        this.cards[firstIndex].flipped = false;
        this.cards[secondIndex].flipped = false;
        
        firstElement.classList.remove('flipped');
        secondElement.classList.remove('flipped');
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.timer = 0;
        this.updateTimerDisplay();
        this.stopTimer();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = timeString;
    }
    
    gameCompleted() {
        this.gameEnded = true;
        this.stopTimer();
        
        const finalTimeString = this.timerDisplay.textContent;
        this.finalTime.textContent = finalTimeString;
        
        // Save score and check if it's a new best
        const isNewBest = this.saveScore(this.timer);
        
        // Update completion message
        const completionTitle = document.getElementById('completionTitle');
        const achievement = document.getElementById('achievement');
        
        if (isNewBest) {
            completionTitle.textContent = 'NEW RECORD ACHIEVED!';
            achievement.style.display = 'block';
        } else {
            completionTitle.textContent = 'MISSION ACCOMPLISHED!';
            achievement.style.display = 'none';
        }
        
        // Show completion screen
        this.gameComplete.classList.add('show');
        
        // Add celebration effect
        this.createCelebrationEffect();
    }
    
    saveScore(timeInSeconds) {
        const bestKey = `best_${this.currentMode}`;
        
        // Get existing best time
        let bestTime = parseInt(localStorage.getItem(bestKey) || '999999');
        
        // Check if new best
        let isNewBest = false;
        if (timeInSeconds < bestTime) {
            bestTime = timeInSeconds;
            isNewBest = true;
            localStorage.setItem(bestKey, bestTime.toString());
        }
        
        return isNewBest;
    }
    
    loadScores() {
        // Scores are loaded from localStorage when needed
    }
    
    displayScores() {
        // Display scores for both modes
        [16, 36].forEach(mode => {
            const bestKey = `best_${mode}`;
            
            const bestTime = parseInt(localStorage.getItem(bestKey) || '0');
            
            const bestScoreElement = document.getElementById(`bestScore${mode}`);
            
            // Display best score
            if (bestTime > 0) {
                const minutes = Math.floor(bestTime / 60);
                const seconds = bestTime % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                bestScoreElement.textContent = `Best: ${timeString}`;
            }
        });
    }
    
    createCelebrationEffect() {
        // Add some sparkle effects
        const sparkles = [];
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.width = '4px';
            sparkle.style.height = '4px';
            sparkle.style.background = '#00ff00';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '9999';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = Math.random() * window.innerHeight + 'px';
            sparkle.style.animation = `sparkle 3s ease-out forwards`;
            
            document.body.appendChild(sparkle);
            sparkles.push(sparkle);
        }
        
        // Clean up sparkles after animation
        setTimeout(() => {
            sparkles.forEach(sparkle => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            });
        }, 3000);
    }
    
    restartGame() {
        // Reset game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameEnded = false;
        
        // Hide completion screen
        this.gameComplete.classList.remove('show');
        
        // Reinitialize game
        this.initializeGame();
    }
    
    backToMenu() {
        this.gameContainer.style.display = 'none';
        this.modeSelection.style.display = 'flex';
        this.gameComplete.classList.remove('show');
        this.displayScores(); // Refresh scores display
    }
    
    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Global functions for buttons
        window.startGame = (mode) => this.startGame(mode);
        window.restartCurrentGame = () => this.restartGame();
        window.backToMenu = () => this.backToMenu();
    }
}

// Add sparkle animation keyframes
const sparkleKeyframes = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
            box-shadow: 0 0 0 rgba(0, 255, 0, 0);
        }
        50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
            box-shadow: 0 0 0 rgba(0, 255, 0, 0);
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = sparkleKeyframes;
document.head.appendChild(styleSheet);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new IntergalacticMemory();
});
