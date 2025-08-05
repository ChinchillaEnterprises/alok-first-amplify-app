// Audio Manager for System Sounds
class AudioManager {
    constructor() {
        // Start with false by default, will be overridden by saved preference
        this.touchSoundsEnabled = false;
        this.touchSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeSzfDMeSwFJHfE8N2KNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfE8N2KNwgZaLvt559NEAxQp+PwtmMcBjiP1/LJeCkEIWu38NSENwUWZ73s6qVTFwxSq+zwyGkcBDCIzO7PfSwGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeSxPDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDeS1fDMeTMGJHfH8N2QQAoUXrTp66hVFA==');
        
        // Load preferences immediately
        this.loadTouchSoundPreference();
        
        // Set up click listener
        this.setupClickListener();
    }
    
    loadTouchSoundPreference() {
        // Try to load from current driver profile
        if (window.driverProfileManager) {
            const currentDriver = window.driverProfileManager.getCurrentDriver();
            if (currentDriver && window.driverProfileManager.profiles[currentDriver]) {
                const profile = window.driverProfileManager.profiles[currentDriver];
                this.touchSoundsEnabled = profile.preferences.system.keyClickSound;
                console.log(`Loaded touch sounds for ${currentDriver}: ${this.touchSoundsEnabled}`);
                return;
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('audi_touch_sounds');
        if (saved !== null) {
            this.touchSoundsEnabled = saved === 'true';
        }
    }
    
    setupClickListener() {
        document.addEventListener('click', (e) => {
            // Only play sound for interactive elements
            const target = e.target.closest('button, .nav-btn, .control-btn, .toggle-switch, .setting-btn, input[type="range"]');
            
            if (target && this.touchSoundsEnabled) {
                // Clone and play the sound to allow multiple quick clicks
                const sound = this.touchSound.cloneNode();
                sound.volume = 0.3;
                sound.play().catch(() => {
                    // Ignore errors (e.g., autoplay policy)
                });
            }
        });
    }
    
    setTouchSoundsEnabled(enabled) {
        this.touchSoundsEnabled = enabled;
        
        // Save to current driver profile
        if (window.driverProfileManager) {
            const currentDriver = window.driverProfileManager.getCurrentDriver();
            if (currentDriver && window.driverProfileManager.profiles[currentDriver]) {
                window.driverProfileManager.profiles[currentDriver].preferences.system.keyClickSound = enabled;
                window.driverProfileManager.saveProfile(currentDriver);
            }
        } else {
            // Fallback to localStorage
            localStorage.setItem('audi_touch_sounds', enabled);
        }
    }
}

// Create global instance
window.audioManager = new AudioManager();
console.log('AudioManager initialized with touchSoundsEnabled:', window.audioManager.touchSoundsEnabled);