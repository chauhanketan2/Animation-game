class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.size = 4;
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.querySelector('.game-message');
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.updateScore();
        this.clearTiles();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.hideGameMessage();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleMove(e.key);
            }
        });
        
        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            let touchEndX = e.changedTouches[0].clientX;
            let touchEndY = e.changedTouches[0].clientY;
            
            let dx = touchEndX - touchStartX;
            let dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    this.handleMove('ArrowRight');
                } else {
                    this.handleMove('ArrowLeft');
                }
            } else {
                if (dy > 0) {
                    this.handleMove('ArrowDown');
                } else {
                    this.handleMove('ArrowUp');
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
        
        // New game button
        document.querySelector('.retry-button').addEventListener('click', () => {
            this.init();
        });
    }
    
    handleMove(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        switch(direction) {
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.checkWin()) {
                this.showGameMessage('You Win!', 'game-won');
            } else if (this.checkGameOver()) {
                this.showGameMessage('Game Over!', 'game-over');
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let row = 0; row < this.size; row++) {
            const newRow = this.slideAndMerge(this.grid[row]);
            if (newRow.toString() !== this.grid[row].toString()) {
                moved = true;
                this.grid[row] = newRow;
            }
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let row = 0; row < this.size; row++) {
            const reversed = this.grid[row].slice().reverse();
            const newRow = this.slideAndMerge(reversed).reverse();
            if (newRow.toString() !== this.grid[row].toString()) {
                moved = true;
                this.grid[row] = newRow;
            }
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let col = 0; col < this.size; col++) {
            const column = this.grid.map(row => row[col]);
            const newColumn = this.slideAndMerge(column);
            if (newColumn.toString() !== column.toString()) {
                moved = true;
                for (let row = 0; row < this.size; row++) {
                    this.grid[row][col] = newColumn[row];
                }
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let col = 0; col < this.size; col++) {
            const column = this.grid.map(row => row[col]).reverse();
            const newColumn = this.slideAndMerge(column).reverse();
            const originalColumn = this.grid.map(row => row[col]);
            if (newColumn.toString() !== originalColumn.toString()) {
                moved = true;
                for (let row = 0; row < this.size; row++) {
                    this.grid[row][col] = newColumn[row];
                }
            }
        }
        return moved;
    }
    
    slideAndMerge(arr) {
        // Remove zeros
        let newArr = arr.filter(val => val !== 0);
        
        // Merge adjacent equal numbers
        for (let i = 0; i < newArr.length - 1; i++) {
            if (newArr[i] === newArr[i + 1]) {
                newArr[i] *= 2;
                this.score += newArr[i];
                newArr.splice(i + 1, 1);
            }
        }
        
        // Add zeros back to reach original length
        while (newArr.length < this.size) {
            newArr.push(0);
        }
        
        return newArr;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    updateDisplay() {
        this.clearTiles();
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== 0) {
                    this.createTile(this.grid[row][col], row, col);
                }
            }
        }
        
        this.updateScore();
    }
    
    createTile(value, row, col) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (value > 2048) {
            tile.className = 'tile tile-super';
        }
        tile.textContent = value;
        tile.style.left = `${col * 121.25 + 15}px`;
        tile.style.top = `${row * 121.25 + 15}px`;
        this.tileContainer.appendChild(tile);
    }
    
    clearTiles() {
        this.tileContainer.innerHTML = '';
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            localStorage.setItem('bestScore', this.bestScore);
        }
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    checkWin() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // Check for empty cells
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.grid[row][col];
                
                // Check right
                if (col < this.size - 1 && this.grid[row][col + 1] === current) {
                    return false;
                }
                
                // Check down
                if (row < this.size - 1 && this.grid[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showGameMessage(message, className) {
        this.gameMessage.querySelector('p').textContent = message;
        this.gameMessage.className = `game-message ${className}`;
        this.gameMessage.style.display = 'block';
    }
    
    hideGameMessage() {
        this.gameMessage.style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
