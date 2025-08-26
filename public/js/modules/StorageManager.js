class StorageManager {
    constructor() {
        this.SONGS_KEY = 'rhythmGameSongs';
        this.DANCERS_KEY = 'rhythmGameDancers';
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
            localStorage.setItem(this.SONGS_KEY, JSON.stringify(songs));
            return true;
        } catch (error) {
            console.error('Error saving songs to localStorage:', error);
            return false;
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
            localStorage.setItem(this.DANCERS_KEY, JSON.stringify(dancers));
            return true;
        } catch (error) {
            console.error('Error saving dancers to localStorage:', error);
            return false;
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
}

// Create singleton instance
const storageManager = new StorageManager();
export default storageManager;