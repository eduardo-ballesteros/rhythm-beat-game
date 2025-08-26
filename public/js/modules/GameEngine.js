import { ARROW_SPEED, HIT_TOLERANCE } from './Constants.js';

class GameEngine {
    constructor() {
        this.playArea = null;
        this.receptorContainer = null;
    }
    
    initialize() {
        this.playArea = document.getElementById('play-area');
        this.receptorContainer = document.getElementById('receptor-container');
    }
    
    gameLoop(timestamp, gameState, audioSystem, uiManager) {
        if (!gameState.isGameRunning) return;
        
        const elapsedTime = timestamp - gameState.gameStartTime;
        
        if (!gameState.isRecording) {
            let songEnded = false;
            
            // Spawn new arrows based on song chart
            while (gameState.nextNoteIndex < gameState.songChart.chart.length && 
                   gameState.songChart.chart[gameState.nextNoteIndex].time <= elapsedTime) {
                const note = gameState.songChart.chart[gameState.nextNoteIndex];
                
                if (note.key === 'END') {
                    songEnded = true;
                } else {
                    this.spawnArrow(note.key, gameState);
                }
                gameState.nextNoteIndex++;
            }
            
            // Check if song ended and all arrows are gone
            if (songEnded && gameState.activeArrows.length === 0) {
                return 'END_GAME';
            }
            
            // Update arrow positions and check for misses
            this.updateArrows(elapsedTime, gameState, audioSystem, uiManager);
        }
        
        return 'CONTINUE';
    }
    
    spawnArrow(key, gameState) {
        const arrowEl = document.createElement('div');
        arrowEl.className = `arrow moving arrow-${key.replace('Arrow', '').toLowerCase()}`;
        
        const receptor = document.querySelector(`.arrow-receptor[data-key="${key}"]`);
        if (receptor && this.playArea) {
            arrowEl.style.left = `${receptor.offsetLeft}px`;
            arrowEl.style.top = `${this.playArea.clientHeight}px`;
            this.playArea.appendChild(arrowEl);
            
            gameState.activeArrows.push({
                element: arrowEl,
                key: key,
                spawnTime: performance.now() - gameState.gameStartTime
            });
        }
    }
    
    updateArrows(elapsedTime, gameState, audioSystem, uiManager) {
        const playAreaBounds = this.playArea.getBoundingClientRect();
        
        gameState.activeArrows.forEach(arrow => {
            const timeSinceSpawn = elapsedTime - arrow.spawnTime;
            const newY = -((timeSinceSpawn / 1000) * ARROW_SPEED);
            arrow.element.style.transform = `translateY(${newY}px)`;
            
            // Check if arrow missed (went off screen)
            const arrowRect = arrow.element.getBoundingClientRect();
            if (arrowRect.bottom < playAreaBounds.top) {
                this.missArrow(audioSystem, uiManager);
                arrow.element.remove();
                arrow.toRemove = true;
            }
        });
        
        // Remove missed arrows
        gameState.activeArrows = gameState.activeArrows.filter(a => !a.toRemove);
    }
    
    handleKeyPress(key, gameState, audioSystem, uiManager) {
        if (!gameState.isGameRunning) return;
        if (gameState.currentlyPressedKeys.has(key) || gameState.currentlyPressedKeys.size >= 2) return;
        
        gameState.currentlyPressedKeys.add(key);
        const receptor = document.querySelector(`.arrow-receptor[data-key="${key}"]`);
        
        if (!gameState.isRecording) {
            // Find the closest arrow to hit
            const potentialHits = gameState.activeArrows
                .filter(arrow => arrow.key === key)
                .sort((a, b) => a.element.getBoundingClientRect().top - b.element.getBoundingClientRect().top);
            
            if (potentialHits.length > 0) {
                const arrow = potentialHits[0];
                const distance = this.calculateHitDistance(arrow, receptor);
                
                if (distance < HIT_TOLERANCE) {
                    const accuracy = (HIT_TOLERANCE - distance) / HIT_TOLERANCE;
                    this.handleHit(arrow, receptor, accuracy, gameState, audioSystem, uiManager);
                }
            }
        }
    }
    
    calculateHitDistance(arrow, receptor) {
        const receptorPos = receptor.getBoundingClientRect();
        const arrowPos = arrow.element.getBoundingClientRect();
        const hitZoneCenterY = receptorPos.top + receptorPos.height / 2;
        const arrowCenterY = arrowPos.top + arrowPos.height / 2;
        return Math.abs(arrowCenterY - hitZoneCenterY);
    }
    
    handleHit(arrow, receptor, accuracy, gameState, audioSystem, uiManager) {
        let pointsAwarded, feedbackText, feedbackColor, feedbackSize;
        
        if (accuracy > 0.95) {
            pointsAwarded = gameState.currentBaseScore + 50;
            feedbackText = "Perfect!!";
            feedbackColor = "#facc15";
            feedbackSize = 48;
        } else if (accuracy < 0.30) {
            pointsAwarded = Math.round(gameState.currentBaseScore * 0.5);
            feedbackText = "OK";
            feedbackColor = "#9ca3af";
            feedbackSize = 24;
        } else {
            pointsAwarded = gameState.currentBaseScore;
            feedbackText = "Good!";
            feedbackColor = "#3b82f6";
            feedbackSize = 32;
        }
        
        gameState.addScore(pointsAwarded);
        audioSystem.playHitSound(arrow.key);
        uiManager.showHitFeedback(feedbackText, receptor, feedbackColor, feedbackSize);
        
        // Visual feedback on receptor
        receptor.classList.add('hit');
        setTimeout(() => receptor.classList.remove('hit'), 200);
        
        // Remove the arrow
        arrow.element.remove();
        gameState.activeArrows = gameState.activeArrows.filter(a => a !== arrow);
    }
    
    missArrow(audioSystem, uiManager) {
        audioSystem.playMissSound();
        uiManager.addShakeAnimation();
    }
    
    handleKeyRelease(key, gameState) {
        gameState.currentlyPressedKeys.delete(key);
    }
}

// Create singleton instance
const gameEngine = new GameEngine();
export default gameEngine;