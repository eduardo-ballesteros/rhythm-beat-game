/**
 * PatternGenerator.js
 * AI pattern generation (drum + melody) with mock responses
 */

import { API_CONFIG, DRUM_MACHINE_CONFIG } from './DrumConstants.js';

export class PatternGenerator {
    constructor() {
        this.isGenerating = false;
    }

    /**
     * Generate drum pattern based on user input
     * @param {string} userInput - Description of desired beat
     * @returns {Promise<Object|null>} Generated pattern or null if failed
     */
    async generateDrumPattern(userInput) {
        if (this.isGenerating) {
            return null;
        }
        
        this.isGenerating = true;
        
        try {
            if (API_CONFIG.USE_MOCK_RESPONSES) {
                // Mock response with delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                return this.getMockDrumPattern(userInput);
            } else {
                // TODO: Replace with actual API call
                return await this.callDrumPatternAPI(userInput);
            }
        } catch (error) {
            console.error('Error generating drum pattern:', error);
            return null;
        } finally {
            this.isGenerating = false;
        }
    }


    /**
     * Mock drum pattern generator for development
     * @param {string} userInput - User description
     * @returns {Object} Mock drum pattern
     */
    getMockDrumPattern(userInput) {
        const input = userInput.toLowerCase();
        
        // Different patterns based on keywords
        if (input.includes('house') || input.includes('four on the floor')) {
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('funk') || input.includes('breakbeat')) {
            return {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
                openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('rock') || input.includes('punk')) {
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        } else if (input.includes('latin') || input.includes('salsa')) {
            return {
                kick: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
                openhat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
            };
        } else {
            // Default pattern with some randomization
            return {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                openhat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            };
        }
    }


    /**
     * Call actual drum pattern API (placeholder for real implementation)
     * @param {string} userInput - User description
     * @returns {Promise<Object>} API response
     */
    async callDrumPatternAPI(userInput) {
        // TODO: Implement actual API call
        const response = await fetch(API_CONFIG.ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // TODO: Add API key header
            },
            body: JSON.stringify({
                model: API_CONFIG.MODEL,
                max_tokens: API_CONFIG.MAX_TOKENS,
                messages: [
                    {
                        role: "user",
                        content: `Create a drum pattern for: "${userInput}". 

Return ONLY a valid JSON object with this exact structure:
{
  "kick": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  "snare": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  "hihat": [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  "openhat": [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
  "crash": [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "clap": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
}

Each array has exactly 16 steps. Use 1 for hit, 0 for rest. Create a pattern that matches the style described. DO NOT include any text outside the JSON.`
                    }
                ]
            })
        });

        const data = await response.json();
        const responseText = data.content[0].text.trim();
        const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        return JSON.parse(cleanedResponse);
    }


    /**
     * Check if drum pattern generation is in progress
     */
    isGeneratingDrumPattern() {
        return this.isGenerating;
    }

    /**
     * Check if any generation is in progress
     */
    isBusy() {
        return this.isGenerating;
    }
}