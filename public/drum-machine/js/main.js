/**
 * main.js
 * Main entry point for the drum machine application
 */

import { DrumSounds } from './modules/DrumSounds.js';
import { DrumSequencer } from './modules/DrumSequencer.js';
import { PatternGenerator } from './modules/PatternGenerator.js';
import { DrumUI } from './modules/DrumUI.js';
import { MelodySystem } from './modules/MelodySystem.js';

/**
 * Main Drum Machine Application Class
 */
class DrumMachine {
    constructor() {
        this.drumSounds = null;
        this.sequencer = null;
        this.patternGenerator = null;
        this.melodySystem = null;
        this.ui = null;
        this.initialized = false;
    }

    /**
     * Initialize the drum machine application
     */
    async init() {
        if (this.initialized) {
            return;
        }

        try {
            console.log('Initializing Drum Machine...');

            // Initialize audio systems
            this.drumSounds = new DrumSounds();
            
            // Initialize melody system
            this.melodySystem = new MelodySystem();
            
            // Initialize pattern generator
            this.patternGenerator = new PatternGenerator();

            // Initialize sequencer with callback for step changes
            this.sequencer = new DrumSequencer(
                this.drumSounds,
                (step) => {
                    if (this.ui) {
                        this.ui.onStepChange(step);
                    }
                }
            );

            // Connect melody system to sequencer
            this.sequencer.setMelodySystem(this.melodySystem);

            // Initialize UI
            this.ui = new DrumUI(
                this.sequencer,
                this.patternGenerator
            );
            
            // Wait for DOM to be ready before initializing UI
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize UI components
            this.ui.init();

            this.initialized = true;
            console.log('Drum Machine initialized successfully');

        } catch (error) {
            console.error('Error initializing drum machine:', error);
            this.showError('Failed to initialize drum machine. Please refresh the page.');
        }
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create or update error display
        let errorElement = document.getElementById('error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 5000);
    }

    /**
     * Clean up and dispose of resources
     */
    dispose() {
        if (!this.initialized) {
            return;
        }

        try {
            // Dispose of components in reverse order
            if (this.ui) {
                this.ui.dispose();
            }
            
            if (this.sequencer) {
                this.sequencer.dispose();
            }
            
            if (this.melodySystem) {
                this.melodySystem.dispose();
            }
            
            if (this.drumSounds) {
                this.drumSounds.dispose();
            }

            this.initialized = false;
            console.log('Drum Machine disposed');
        } catch (error) {
            console.error('Error disposing drum machine:', error);
        }
    }

    /**
     * Get initialization status
     */
    isInitialized() {
        return this.initialized;
    }
}

/**
 * Global drum machine instance
 */
let drumMachine = null;

/**
 * Initialize drum machine when DOM is ready
 */
function initDrumMachine() {
    if (drumMachine) {
        return;
    }

    drumMachine = new DrumMachine();
    drumMachine.init().catch(error => {
        console.error('Failed to initialize drum machine:', error);
    });
}

/**
 * Clean up when page unloads
 */
function cleanup() {
    if (drumMachine) {
        drumMachine.dispose();
        drumMachine = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrumMachine);
} else {
    initDrumMachine();
}

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);

// Export for debugging
window.drumMachine = drumMachine;

// Helper function to test audio system
window.testDrumAudio = async function() {
    if (drumMachine && drumMachine.sequencer) {
        return await drumMachine.sequencer.testAudio();
    } else {
        console.error("Drum machine not initialized yet");
        return false;
    }
};

// Helper function to test melody system
window.testMelodyAudio = async function() {
    if (drumMachine && drumMachine.melodySystem) {
        return await drumMachine.melodySystem.testMelody();
    } else {
        console.error("Melody system not initialized yet");
        return false;
    }
};

// Also export the DrumMachine class for potential external use
export { DrumMachine };