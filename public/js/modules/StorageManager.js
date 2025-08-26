class StorageManager {
    constructor() {
        this.SONGS_KEY = 'rhythmGameSongs';
        this.DANCERS_KEY = 'rhythmGameDancers';
        this.STORAGE_LIMIT_MB = 5; // Conservative localStorage limit
        this.STORAGE_WARNING_THRESHOLD = 0.8; // Warning at 80% capacity
    }
    
    loadSongs() {
        try {
            const savedSongs = localStorage.getItem(this.SONGS_KEY);
            return savedSongs ? JSON.parse(savedSongs) : [];
        } catch (error) {
            console.error('Error loading songs from localStorage:', error);
            return [];
        }
    }
    
    saveSongs(songs) {
        try {
            const songsData = JSON.stringify(songs);
            const songsSize = this.getSizeInMB(songsData);
            
            console.log(`Attempting to save ${songs.length} songs (${songsSize.toFixed(2)} MB)`);
            
            // Check if this would exceed storage limits
            const currentSize = this.getUsedStorageMB();
            const existingSongsSize = this.getSongStorageMB();
            const newTotalSize = currentSize - existingSongsSize + songsSize;
            
            if (newTotalSize > this.STORAGE_LIMIT_MB) {
                const error = new Error(`Storage limit exceeded. Would use ${newTotalSize.toFixed(2)} MB (limit: ${this.STORAGE_LIMIT_MB} MB)`);
                error.type = 'STORAGE_LIMIT_EXCEEDED';
                error.requiredSpace = songsSize;
                error.availableSpace = this.STORAGE_LIMIT_MB - (currentSize - existingSongsSize);
                throw error;
            }
            
            localStorage.setItem(this.SONGS_KEY, songsData);
            console.log(`Successfully saved ${songs.length} songs. Storage usage: ${this.getUsedStorageMB().toFixed(2)} MB`);
            return true;
        } catch (error) {
            console.error('Error saving songs to localStorage:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                error.type = 'QUOTA_EXCEEDED';
            }
            throw error; // Re-throw so caller can handle
        }
    }
    
    loadDancers() {
        try {
            const savedDancers = localStorage.getItem(this.DANCERS_KEY);
            return savedDancers ? JSON.parse(savedDancers) : [];
        } catch (error) {
            console.error('Error loading dancers from localStorage:', error);
            return [];
        }
    }
    
    saveDancers(dancers) {
        try {
            const dancersData = JSON.stringify(dancers);
            const dancersSize = this.getSizeInMB(dancersData);
            
            console.log(`Attempting to save ${dancers.length} dancers (${dancersSize.toFixed(2)} MB)`);
            
            // Check if this would exceed storage limits
            const currentSize = this.getUsedStorageMB();
            const existingDancersSize = this.getDancerStorageMB();
            const newTotalSize = currentSize - existingDancersSize + dancersSize;
            
            if (newTotalSize > this.STORAGE_LIMIT_MB) {
                const error = new Error(`Storage limit exceeded. Would use ${newTotalSize.toFixed(2)} MB (limit: ${this.STORAGE_LIMIT_MB} MB)`);
                error.type = 'STORAGE_LIMIT_EXCEEDED';
                error.requiredSpace = dancersSize;
                error.availableSpace = this.STORAGE_LIMIT_MB - (currentSize - existingDancersSize);
                throw error;
            }
            
            localStorage.setItem(this.DANCERS_KEY, dancersData);
            console.log(`Successfully saved ${dancers.length} dancers. Storage usage: ${this.getUsedStorageMB().toFixed(2)} MB`);
            return true;
        } catch (error) {
            console.error('Error saving dancers to localStorage:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                error.type = 'QUOTA_EXCEEDED';
            }
            throw error; // Re-throw so caller can handle
        }
    }
    
    clearAllData() {
        try {
            localStorage.removeItem(this.SONGS_KEY);
            localStorage.removeItem(this.DANCERS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
    
    // Helper method to check if localStorage is available
    isLocalStorageAvailable() {
        try {
            const test = 'localStorage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Storage diagnostics and management methods
    getSizeInMB(str) {
        return new Blob([str]).size / (1024 * 1024);
    }
    
    getUsedStorageMB() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        return totalSize / (1024 * 1024);
    }
    
    getSongStorageMB() {
        try {
            const songsData = localStorage.getItem(this.SONGS_KEY);
            return songsData ? this.getSizeInMB(songsData) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    getDancerStorageMB() {
        try {
            const dancersData = localStorage.getItem(this.DANCERS_KEY);
            return dancersData ? this.getSizeInMB(dancersData) : 0;
        } catch (error) {
            return 0;
        }
    }
    
    getStorageInfo() {
        const totalUsed = this.getUsedStorageMB();
        const songsSize = this.getSongStorageMB();
        const dancersSize = this.getDancerStorageMB();
        const availableSpace = this.STORAGE_LIMIT_MB - totalUsed;
        const usagePercent = (totalUsed / this.STORAGE_LIMIT_MB) * 100;
        
        return {
            totalUsedMB: totalUsed,
            songsStorageMB: songsSize,
            dancersStorageMB: dancersSize,
            availableSpaceMB: availableSpace,
            usagePercent: usagePercent,
            isNearLimit: usagePercent > (this.STORAGE_WARNING_THRESHOLD * 100),
            limitMB: this.STORAGE_LIMIT_MB,
            songsCount: this.loadSongs().length,
            dancersCount: this.loadDancers().length
        };
    }
    
    // Storage cleanup methods
    removeOldestSongs(count = 1) {
        try {
            const songs = this.loadSongs();
            if (songs.length <= count) {
                console.warn('Cannot remove all songs');
                return false;
            }
            
            // Remove oldest songs (assuming they're in order)
            const updatedSongs = songs.slice(count);
            localStorage.setItem(this.SONGS_KEY, JSON.stringify(updatedSongs));
            console.log(`Removed ${count} oldest songs`);
            return true;
        } catch (error) {
            console.error('Error removing old songs:', error);
            return false;
        }
    }
    
    removeOldestDancers(count = 1) {
        try {
            const dancers = this.loadDancers();
            if (dancers.length <= count) {
                console.warn('Cannot remove all dancers');
                return false;
            }
            
            // Remove oldest dancers (assuming they're in order)
            const updatedDancers = dancers.slice(count);
            localStorage.setItem(this.DANCERS_KEY, JSON.stringify(updatedDancers));
            console.log(`Removed ${count} oldest dancers`);
            return true;
        } catch (error) {
            console.error('Error removing old dancers:', error);
            return false;
        }
    }
    
    // Smart storage management - automatically free space if needed
    freeUpSpace(requiredSpaceMB) {
        const info = this.getStorageInfo();
        if (info.availableSpaceMB >= requiredSpaceMB) {
            return true; // Already have enough space
        }
        
        const spaceNeeded = requiredSpaceMB - info.availableSpaceMB;
        console.log(`Need to free up ${spaceNeeded.toFixed(2)} MB of space`);
        
        // Strategy: Remove oldest songs first, then dancers
        let freedSpace = 0;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (freedSpace < spaceNeeded && attempts < maxAttempts) {
            const beforeInfo = this.getStorageInfo();
            
            // Try to remove an old song first
            if (beforeInfo.songsCount > 1) {
                if (this.removeOldestSongs(1)) {
                    const afterInfo = this.getStorageInfo();
                    freedSpace = beforeInfo.totalUsedMB - afterInfo.totalUsedMB;
                    console.log(`Freed ${freedSpace.toFixed(2)} MB by removing song`);
                    continue;
                }
            }
            
            // If no songs to remove or removal failed, try dancers
            if (beforeInfo.dancersCount > 1) {
                if (this.removeOldestDancers(1)) {
                    const afterInfo = this.getStorageInfo();
                    freedSpace = beforeInfo.totalUsedMB - afterInfo.totalUsedMB;
                    console.log(`Freed ${freedSpace.toFixed(2)} MB by removing dancer`);
                    continue;
                }
            }
            
            break; // Can't free any more space
        }
        
        const finalInfo = this.getStorageInfo();
        return finalInfo.availableSpaceMB >= requiredSpaceMB;
    }
}

// Create singleton instance
const storageManager = new StorageManager();

// Log storage info on startup
if (storageManager.isLocalStorageAvailable()) {
    const info = storageManager.getStorageInfo();
    console.log('Storage Info:', {
        used: `${info.totalUsedMB.toFixed(2)} MB`,
        available: `${info.availableSpaceMB.toFixed(2)} MB`,
        usage: `${info.usagePercent.toFixed(1)}%`,
        songs: info.songsCount,
        dancers: info.dancersCount
    });
    
    if (info.isNearLimit) {
        console.warn(`⚠️  Storage usage is at ${info.usagePercent.toFixed(1)}% - consider cleaning up old items`);
    }
}

export default storageManager;