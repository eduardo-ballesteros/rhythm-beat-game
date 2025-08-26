class DancerSystem {
    constructor() {
        this.videoStream = null;
        this.dancerPoses = [];
        this.poseAnimationId = null;
        this.dancerImg = null;
        this.photoCanvas = null;
        this.videoFeed = null;
    }
    
    initialize() {
        this.dancerImg = document.getElementById('dancer-img');
        this.photoCanvas = document.getElementById('photo-canvas');
        this.videoFeed = document.getElementById('video-feed');
    }
    
    async openCamera() {
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoFeed.srcObject = this.videoStream;
            return true;
        } catch (err) {
            console.error("Error accessing camera: ", err);
            return false;
        }
    }
    
    closeCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }
    
    startPoseAnimation(poses = null) {
        if (this.poseAnimationId) {
            clearInterval(this.poseAnimationId);
        }
        
        const posesToUse = poses || this.dancerPoses;
        if (posesToUse.length === 0) return;
        
        this.dancerImg.src = posesToUse[0];
        this.dancerImg.classList.remove('hidden');
        
        let currentPoseIndex = 0;
        this.poseAnimationId = setInterval(() => {
            currentPoseIndex = (currentPoseIndex + 1) % posesToUse.length;
            this.dancerImg.src = posesToUse[currentPoseIndex];
        }, 500);
    }
    
    stopPoseAnimation() {
        if (this.poseAnimationId) {
            clearInterval(this.poseAnimationId);
            this.poseAnimationId = null;
        }
        if (this.dancerImg) {
            this.dancerImg.classList.add('hidden');
        }
    }
    
    setDancerPoses(poses) {
        this.dancerPoses = poses;
    }
    
    async resizeBase64Image(base64Str, maxWidth) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/png'));
            };
        });
    }
    
    capturePhoto() {
        if (!this.videoFeed || !this.photoCanvas) {
            throw new Error('Video feed or canvas not available');
        }
        
        const context = this.photoCanvas.getContext('2d');
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / this.videoFeed.videoWidth;
        
        this.photoCanvas.width = MAX_WIDTH;
        this.photoCanvas.height = this.videoFeed.videoHeight * scale;
        
        context.drawImage(this.videoFeed, 0, 0, this.photoCanvas.width, this.photoCanvas.height);
        
        return this.photoCanvas.toDataURL('image/png').split(',')[1];
    }
    
    async generateDancer(dancerName, base64ImageData, onProgressUpdate) {
        try {
            const describePrompt = "Focus only on the face in this photo. Briefly describe the person's physical facial features and hair color, but ignore their current expression. This will be used as a prompt for an AI image generator.";
            const describePayload = {
                contents: [{
                    role: "user",
                    parts: [
                        { text: describePrompt },
                        { inlineData: { mimeType: "image/png", data: base64ImageData } }
                    ]
                }]
            };
            
            const apiKey = ""; // API key would need to be provided
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            // Step 1: Describe the face
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(describePayload)
            });
            
            if (!response.ok) {
                throw new Error(`API error (description): ${response.status}`);
            }
            
            const result = await response.json();
            const description = result.candidates[0].content.parts[0].text;
            
            if (!description) {
                throw new Error("AI could not describe the image.");
            }
            
            // Step 2: Generate 10 dance poses
            const tempPoses = [];
            const baseGenerateUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            
            for (let i = 0; i < 10; i++) {
                if (onProgressUpdate) {
                    onProgressUpdate(`Creating 10 dance poses (${i + 1}/10)...`);
                }
                
                const generatePrompt = `Generate image ${i+1} of 10. A full-body character in the art style of 'Friday Night Funkin'. The character's face should be inspired by this description: "${description}". Crucially, the character must have a cool, fun vibe, with a big smile or a laughing expression. Do not show any other emotions. The overall style is like street graffiti art, using simple, bold line drawings and a vibrant, electric color palette. The character is wearing cool streetwear and is in a unique, dynamic dance pose. The image must have a completely transparent background, showing only the character. Ensure the character is consistent across all 10 images.`;
                
                const generatePayload = {
                    instances: [{ prompt: generatePrompt }],
                    parameters: { "sampleCount": 1 }
                };
                
                const generateResponse = await fetch(baseGenerateUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(generatePayload)
                });
                
                if (!generateResponse.ok) {
                    throw new Error(`API error (generation): ${generateResponse.status} on pose ${i+1}`);
                }
                
                const generateResult = await generateResponse.json();
                const generatedBase64 = generateResult.predictions?.[0]?.bytesBase64Encoded;
                
                if (!generatedBase64) {
                    throw new Error(`AI did not return image for pose ${i+1}.`);
                }
                
                const originalImageUrl = `data:image/png;base64,${generatedBase64}`;
                const resizedImageUrl = await this.resizeBase64Image(originalImageUrl, 400);
                tempPoses.push(resizedImageUrl);
            }
            
            const dancer = {
                name: dancerName,
                poses: tempPoses
            };
            
            this.setDancerPoses(tempPoses);
            this.startPoseAnimation();
            
            return dancer;
            
        } catch (error) {
            console.error("Error generating dancer:", error);
            throw error;
        }
    }
    
    dispose() {
        this.stopPoseAnimation();
        this.closeCamera();
    }
}

// Create singleton instance
const dancerSystem = new DancerSystem();
export default dancerSystem;