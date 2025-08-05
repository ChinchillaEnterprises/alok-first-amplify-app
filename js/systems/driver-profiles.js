// Driver Profile Management System
class DriverProfileManager {
    constructor() {
        this.currentDriver = null;
        this.profiles = {
            driver1: this.loadProfile('driver1') || this.getDefaultProfile('Driver 1'),
            driver2: this.loadProfile('driver2') || this.getDefaultProfile('Driver 2'),
            guest: this.loadProfile('guest') || this.getGuestProfile()
        };
    }
    
    getDefaultProfile(name) {
        return {
            name: name,
            preferences: {
                // Climate settings
                climate: {
                    driverTemp: 72,
                    passengerTemp: 72,
                    fanSpeed: 5,
                    auto: true,
                    ac: true,
                    dualZone: false,
                    seatHeatDriver: false,
                    seatCoolDriver: false,
                    seatHeatPassenger: false,
                    seatCoolPassenger: false
                },
                
                // Media settings
                media: {
                    lastSource: 'Radio',
                    volume: 50,
                    lastRadioStation: 0, // Station index
                    favoriteStations: [],
                    touchSounds: true  // This is in media preferences but should be removed
                },
                
                // Display settings
                display: {
                    brightness: 80,
                    nightMode: false,
                    theme: 'dark'
                },
                
                // Navigation
                navigation: {
                    homeAddress: '',
                    workAddress: '',
                    recentDestinations: []
                },
                
                // Vehicle
                vehicle: {
                    preferredUnits: 'imperial', // or 'metric'
                    driveMode: 'comfort', // sport, eco, comfort
                    temperatureUnit: 'Fahrenheit',
                    distanceUnit: 'Miles',
                    bestLapTime: null // Store best lap time for this driver
                },
                
                // System
                system: {
                    language: 'en',
                    keyClickSound: false,
                    startupSound: true,
                    navigationVoice: true,
                    systemVolume: 75
                }
            },
            
            // Last state when driver exited
            lastState: {
                lastScreen: 'home',
                timestamp: new Date().toISOString()
            }
        };
    }
    
    getGuestProfile() {
        return {
            name: 'Guest',
            preferences: {
                // Climate settings
                climate: {
                    driverTemp: 72,
                    passengerTemp: 72,
                    fanSpeed: 5,
                    auto: true,
                    ac: true,
                    dualZone: false,
                    seatHeatDriver: false,
                    seatCoolDriver: false,
                    seatHeatPassenger: false,
                    seatCoolPassenger: false
                },
                
                // Media settings
                media: {
                    lastSource: 'Radio',
                    volume: 50,
                    lastRadioStation: 0,
                    favoriteStations: [],
                    touchSounds: true
                },
                
                // Display settings
                display: {
                    brightness: 80,
                    nightMode: false,
                    theme: 'dark'
                },
                
                // Navigation
                navigation: {
                    homeAddress: '',
                    workAddress: '',
                    recentDestinations: []
                },
                
                // Vehicle
                vehicle: {
                    preferredUnits: 'imperial',
                    driveMode: 'comfort',
                    temperatureUnit: 'Fahrenheit',
                    distanceUnit: 'Miles',
                    bestLapTime: null
                },
                
                // System - Enable touch sounds for web version
                system: {
                    language: 'en',
                    keyClickSound: true,  // Enable by default for guest/web
                    startupSound: true,
                    navigationVoice: true,
                    systemVolume: 75
                }
            },
            
            // Last state when driver exited
            lastState: {
                lastScreen: 'home',
                timestamp: new Date().toISOString()
            }
        };
    }
    
    loadProfile(driverId) {
        const stored = localStorage.getItem(`audi_profile_${driverId}`);
        return stored ? JSON.parse(stored) : null;
    }
    
    saveProfile(driverId) {
        const profile = this.profiles[driverId];
        if (profile) {
            localStorage.setItem(`audi_profile_${driverId}`, JSON.stringify(profile));
        }
    }
    
    setCurrentDriver(driverId) {
        this.currentDriver = driverId;
        localStorage.setItem('audi_current_driver', driverId);
        this.applyProfile(driverId);
    }
    
    getCurrentDriver() {
        return this.currentDriver || localStorage.getItem('audi_current_driver');
    }
    
    applyProfile(driverId) {
        const profile = this.profiles[driverId];
        if (!profile) return;
        
        // Apply climate settings
        this.applyClimateSettings(profile.preferences.climate);
        
        // Apply media settings
        this.applyMediaSettings(profile.preferences.media);
        
        // Apply display settings
        this.applyDisplaySettings(profile.preferences.display);
        
        // Apply other preferences
        this.applySystemSettings(profile.preferences.system);
        
        // Apply vehicle settings including best lap time
        this.applyVehicleSettings(profile.preferences.vehicle);
        
        console.log(`Profile loaded for ${profile.name}`);
    }
    
    applyClimateSettings(climate) {
        // Use the climate manager to load state
        if (window.climateManager) {
            window.climateManager.loadState(climate);
        } else {
            // Fallback if climate manager not loaded yet
            window.climateState = climate;
        }
    }
    
    applyMediaSettings(media) {
        // Set volume
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) volumeSlider.value = media.volume;
        
        // Set last source
        if (window.currentMediaSource) {
            window.currentMediaSource = media.lastSource;
        }
        
        // Set radio station
        if (window.radioPlayer && window.radioPlayer.stations) {
            window.radioPlayer.currentStation = media.lastRadioStation;
        }
        
        // Touch sounds are now in system preferences, not media
    }
    
    applyDisplaySettings(display) {
        // Apply theme immediately
        document.body.setAttribute('data-theme', display.theme);
        if (display.theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
        
        // Apply brightness
        document.body.style.filter = `brightness(${display.brightness}%)`;
        
        // Apply night mode
        document.body.classList.toggle('night-mode', display.nightMode);
        
        // Use the settings manager to load all settings
        if (window.settingsManager) {
            const settingsData = {
                brightness: display.brightness,
                nightMode: display.nightMode,
                theme: display.theme,
                touchSounds: this.profiles[this.currentDriver].preferences.system.keyClickSound,
                navigationVoice: this.profiles[this.currentDriver].preferences.system.navigationVoice,
                systemVolume: this.profiles[this.currentDriver].preferences.system.systemVolume,
                temperatureUnit: this.profiles[this.currentDriver].preferences.vehicle.temperatureUnit,
                distanceUnit: this.profiles[this.currentDriver].preferences.vehicle.distanceUnit
            };
            window.settingsManager.loadState(settingsData);
        }
    }
    
    applySystemSettings(system) {
        console.log('Applying system settings, keyClickSound:', system.keyClickSound);
        
        // Apply key click sounds
        const touchSoundsToggle = document.getElementById('touch-sounds');
        if (touchSoundsToggle) {
            touchSoundsToggle.checked = system.keyClickSound;
            console.log('Set touch sounds toggle to:', system.keyClickSound);
        }
        
        // Apply to audio manager (this is what actually controls the sounds)
        if (window.audioManager) {
            window.audioManager.touchSoundsEnabled = system.keyClickSound;
            console.log('Set audioManager.touchSoundsEnabled to:', system.keyClickSound);
        } else {
            console.warn('AudioManager not available when applying system settings');
        }
        
        // Apply navigation voice
        const navVoiceToggle = document.getElementById('nav-voice');
        if (navVoiceToggle) {
            navVoiceToggle.checked = system.navigationVoice;
        }
        
        // Apply system volume
        const volumeElements = document.querySelectorAll('.setting-slider');
        if (volumeElements.length > 1) {
            const systemVolumeSlider = volumeElements[1];
            systemVolumeSlider.value = system.systemVolume;
        }
    }
    
    applyVehicleSettings(vehicle) {
        // Apply best lap time
        if (vehicle.bestLapTime !== undefined) {
            // Set the global bestLapTime variable
            window.bestLapTime = vehicle.bestLapTime;
            
            // Update the display
            const bestTimeDisplay = document.getElementById('best-time');
            if (bestTimeDisplay) {
                bestTimeDisplay.textContent = vehicle.bestLapTime || '--:--:--';
            }
            
            console.log(`Applied best lap time for driver: ${vehicle.bestLapTime || 'none'}`);
        }
        
        // Temperature and distance units are already handled by settings manager
    }
    
    updateButton(selector, active) {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.classList.toggle('active', active);
        }
    }
    
    saveCurrentState() {
        if (!this.currentDriver) return;
        
        const profile = this.profiles[this.currentDriver];
        if (!profile) return;
        
        // Save current climate state
        if (window.climateState) {
            Object.assign(profile.preferences.climate, window.climateState);
        }
        
        // Save current media state
        profile.preferences.media.volume = document.querySelector('.volume-slider')?.value || 50;
        profile.preferences.media.lastSource = window.currentMediaSource || 'Radio';
        if (window.radioPlayer) {
            profile.preferences.media.lastRadioStation = window.radioPlayer.currentStation || 0;
        }
        
        // Save display settings
        const brightnessSlider = document.getElementById('brightness-slider');
        if (brightnessSlider) {
            profile.preferences.display.brightness = parseInt(brightnessSlider.value);
        }
        profile.preferences.display.nightMode = document.body.classList.contains('night-mode');
        
        // Save theme from settings manager or body attribute
        if (window.settingsManager) {
            profile.preferences.display.theme = window.settingsManager.state.theme;
        } else {
            // Fallback to body attribute
            const currentTheme = document.body.getAttribute('data-theme') || 'dark';
            profile.preferences.display.theme = currentTheme;
        }
        
        // Save system settings
        profile.preferences.system.keyClickSound = 
            document.getElementById('touch-sounds')?.checked ?? false;
        
        // Save navigation voice
        const navVoiceToggle = document.getElementById('nav-voice');
        if (navVoiceToggle) {
            profile.preferences.system.navigationVoice = navVoiceToggle.checked;
        }
        
        // Save system volume - in Sound section (3rd section)
        const systemVolumeSlider = document.querySelector('.settings-section:nth-child(3) .setting-slider');
        if (systemVolumeSlider) {
            profile.preferences.system.systemVolume = parseInt(systemVolumeSlider.value);
        }
        
        // Save units
        const tempUnitSelect = document.getElementById('temp-unit-select');
        if (tempUnitSelect) {
            profile.preferences.vehicle.temperatureUnit = tempUnitSelect.value;
        }
        
        const distanceUnitSelect = document.getElementById('distance-unit-select');
        if (distanceUnitSelect) {
            profile.preferences.vehicle.distanceUnit = distanceUnitSelect.value;
        }
        
        // Save best lap time from global variable
        if (window.bestLapTime !== undefined) {
            profile.preferences.vehicle.bestLapTime = window.bestLapTime;
        }
        
        // Update last state
        profile.lastState = {
            lastScreen: window.currentScreen || 'home',
            timestamp: new Date().toISOString()
        };
        
        // Persist to localStorage
        this.saveProfile(this.currentDriver);
    }
    
    // Call this when any setting changes
    onSettingChanged() {
        this.saveCurrentState();
    }
}

// Create global instance
window.driverProfileManager = new DriverProfileManager();

// Auto-save on certain events
document.addEventListener('DOMContentLoaded', () => {
    // Save when switching screens
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.driverProfileManager.saveCurrentState();
        });
    });
    
    // Save when changing settings
    const settingsInputs = document.querySelectorAll(
        '.setting-slider, .toggle-switch input, .setting-select'
    );
    settingsInputs.forEach(input => {
        input.addEventListener('change', () => {
            window.driverProfileManager.onSettingChanged();
        });
    });
    
    // Save periodically
    setInterval(() => {
        window.driverProfileManager.saveCurrentState();
    }, 30000); // Every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        window.driverProfileManager.saveCurrentState();
    });
});