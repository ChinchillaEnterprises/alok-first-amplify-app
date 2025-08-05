// Settings Screen Manager
class SettingsManager {
    constructor() {
        this.state = {
            brightness: 80,
            nightMode: false,
            theme: 'dark',
            systemVolume: 75,
            touchSounds: true,
            navigationVoice: true,
            temperatureUnit: 'Fahrenheit',
            distanceUnit: 'Miles'
        };
        
        // Load saved settings immediately
        this.loadSavedSettings();
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.updateAllUI(); // Update UI after DOM is ready
            });
        } else {
            this.setupEventListeners();
            this.updateAllUI(); // Update UI immediately if DOM is ready
        }
    }
    
    loadSavedSettings() {
        // Load settings from driver profile if available
        if (window.driverProfileManager) {
            const currentDriver = window.driverProfileManager.getCurrentDriver();
            if (currentDriver && window.driverProfileManager.profiles[currentDriver]) {
                const profile = window.driverProfileManager.profiles[currentDriver];
                const prefs = profile.preferences;
                
                // Load all settings from profile
                this.state.brightness = prefs.display.brightness;
                this.state.nightMode = prefs.display.nightMode;
                this.state.theme = prefs.display.theme;
                this.state.systemVolume = prefs.system.systemVolume;
                this.state.touchSounds = prefs.system.keyClickSound;
                this.state.navigationVoice = prefs.system.navigationVoice;
                this.state.temperatureUnit = prefs.vehicle.temperatureUnit;
                this.state.distanceUnit = prefs.vehicle.distanceUnit;
            }
        }
    }
    
    setupEventListeners() {
        // Brightness slider
        const brightnessSlider = document.getElementById('brightness-slider');
        const brightnessValue = document.getElementById('brightness-value');
        
        if (brightnessSlider && brightnessValue) {
            brightnessSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                this.state.brightness = parseInt(value);
                brightnessValue.textContent = `${value}%`;
                document.body.style.filter = `brightness(${value}%)`;
                this.saveState();
            });
        }
        
        // Night mode toggle
        const nightModeToggle = document.getElementById('night-mode');
        if (nightModeToggle) {
            nightModeToggle.addEventListener('change', (e) => {
                this.state.nightMode = e.target.checked;
                document.body.classList.toggle('night-mode', e.target.checked);
                this.saveState();
            });
        }
        
        // Touch sounds toggle
        const touchSoundsToggle = document.getElementById('touch-sounds');
        if (touchSoundsToggle) {
            touchSoundsToggle.addEventListener('change', (e) => {
                this.state.touchSounds = e.target.checked;
                if (window.audioManager) {
                    window.audioManager.setTouchSoundsEnabled(e.target.checked);
                }
                this.saveState();
            });
        }
        
        // Navigation voice toggle
        const navVoiceToggle = document.getElementById('nav-voice');
        if (navVoiceToggle) {
            navVoiceToggle.addEventListener('change', (e) => {
                this.state.navigationVoice = e.target.checked;
                this.saveState();
            });
        }
        
        // System volume slider
        const volumeElements = document.querySelectorAll('.setting-slider');
        const systemVolumeSlider = volumeElements[1]; // Second slider is system volume
        if (systemVolumeSlider) {
            systemVolumeSlider.addEventListener('input', (e) => {
                this.state.systemVolume = parseInt(e.target.value);
                this.saveState();
            });
        }
        
        // Temperature unit select
        const tempUnitSelect = document.getElementById('temp-unit-select');
        if (tempUnitSelect) {
            tempUnitSelect.addEventListener('change', (e) => {
                this.state.temperatureUnit = e.target.value;
                this.saveState();
            });
        }
        
        // Distance unit select
        const distanceUnitSelect = document.getElementById('distance-unit-select');
        if (distanceUnitSelect) {
            distanceUnitSelect.addEventListener('change', (e) => {
                this.state.distanceUnit = e.target.value;
                this.saveState();
            });
        }
        
        // Theme select
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.state.theme = e.target.value.toLowerCase();
                document.body.setAttribute('data-theme', this.state.theme);
                
                // Apply theme immediately
                if (this.state.theme === 'light') {
                    document.body.classList.add('light-theme');
                    document.body.classList.remove('dark-theme');
                } else {
                    document.body.classList.add('dark-theme');
                    document.body.classList.remove('light-theme');
                }
                
                this.saveState();
            });
        }
    }
    
    loadState(settingsData) {
        if (!settingsData) return;
        
        // Update internal state
        Object.assign(this.state, {
            brightness: settingsData.brightness || this.state.brightness,
            nightMode: settingsData.nightMode !== undefined ? settingsData.nightMode : this.state.nightMode,
            theme: settingsData.theme || this.state.theme,
            systemVolume: settingsData.systemVolume || this.state.systemVolume,
            touchSounds: settingsData.touchSounds !== undefined ? settingsData.touchSounds : this.state.touchSounds,
            navigationVoice: settingsData.navigationVoice !== undefined ? settingsData.navigationVoice : this.state.navigationVoice,
            temperatureUnit: settingsData.temperatureUnit || this.state.temperatureUnit,
            distanceUnit: settingsData.distanceUnit || this.state.distanceUnit
        });
        
        // Update UI
        this.updateAllUI();
    }
    
    updateAllUI() {
        // Update brightness
        const brightnessSlider = document.getElementById('brightness-slider');
        const brightnessValue = document.getElementById('brightness-value');
        if (brightnessSlider && brightnessValue) {
            brightnessSlider.value = this.state.brightness;
            brightnessValue.textContent = `${this.state.brightness}%`;
            document.body.style.filter = `brightness(${this.state.brightness}%)`;
        }
        
        // Update night mode
        const nightModeToggle = document.getElementById('night-mode');
        if (nightModeToggle) {
            nightModeToggle.checked = this.state.nightMode;
            document.body.classList.toggle('night-mode', this.state.nightMode);
        }
        
        // Update theme
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.state.theme.charAt(0).toUpperCase() + this.state.theme.slice(1);
            document.body.setAttribute('data-theme', this.state.theme);
            
            // Apply theme classes
            if (this.state.theme === 'light') {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            } else {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            }
        }
        
        // Update touch sounds
        const touchSoundsToggle = document.getElementById('touch-sounds');
        if (touchSoundsToggle) {
            touchSoundsToggle.checked = this.state.touchSounds;
            console.log('Settings updateAllUI - setting touch sounds toggle to:', this.state.touchSounds);
            if (window.audioManager) {
                window.audioManager.touchSoundsEnabled = this.state.touchSounds;
                console.log('Settings updateAllUI - updated audioManager.touchSoundsEnabled to:', this.state.touchSounds);
            }
        }
        
        // Update navigation voice
        const navVoiceToggle = document.getElementById('nav-voice');
        if (navVoiceToggle) {
            navVoiceToggle.checked = this.state.navigationVoice;
        }
        
        // Update system volume
        const volumeElements = document.querySelectorAll('.setting-slider');
        if (volumeElements.length > 1) {
            const systemVolumeSlider = volumeElements[1];
            systemVolumeSlider.value = this.state.systemVolume;
        }
        
        // Update temperature unit
        const tempUnitSelect = document.getElementById('temp-unit-select');
        if (tempUnitSelect) {
            tempUnitSelect.value = this.state.temperatureUnit;
        }
        
        // Update distance unit
        const distanceUnitSelect = document.getElementById('distance-unit-select');
        if (distanceUnitSelect) {
            distanceUnitSelect.value = this.state.distanceUnit;
        }
    }
    
    saveState() {
        // Save to driver profile
        if (window.driverProfileManager) {
            const currentDriver = window.driverProfileManager.getCurrentDriver();
            const profile = window.driverProfileManager.profiles[currentDriver];
            
            if (profile) {
                // Update display settings
                profile.preferences.display.brightness = this.state.brightness;
                profile.preferences.display.nightMode = this.state.nightMode;
                profile.preferences.display.theme = this.state.theme;
                
                // Update system settings
                profile.preferences.system.keyClickSound = this.state.touchSounds;
                profile.preferences.system.navigationVoice = this.state.navigationVoice;
                profile.preferences.system.systemVolume = this.state.systemVolume;
                
                // Update vehicle settings
                profile.preferences.vehicle.temperatureUnit = this.state.temperatureUnit;
                profile.preferences.vehicle.distanceUnit = this.state.distanceUnit;
                
                // Save profile
                window.driverProfileManager.saveProfile(currentDriver);
            }
        }
    }
}

// Initialize settings manager
window.settingsManager = new SettingsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
}