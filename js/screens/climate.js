// Climate Control System
class ClimateManager {
    constructor() {
        this.state = {
            driverTemp: 72,
            passengerTemp: 72,
            fanSpeed: 5,
            auto: false,
            ac: false,
            dualZone: false,
            recirculate: false,
            defrost: false,
            rearDefrost: false,
            seatHeatDriver: false,
            seatCoolDriver: false,
            seatHeatPassenger: false,
            seatCoolPassenger: false
        };
        
        // Make state globally accessible
        window.climateState = this.state;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        // Temperature controls
        this.setupTempControls('driver');
        this.setupTempControls('passenger');
        
        // Climate buttons
        this.setupClimateButtons();
        
        // Fan speed
        this.setupFanControl();
        
        // Seat controls
        this.setupSeatControls();
    }
    
    setupTempControls(zone) {
        const zoneElement = document.querySelector(`.climate-zone:${zone === 'driver' ? 'first' : 'last'}-child`);
        if (!zoneElement) return;
        
        const decreaseBtn = zoneElement.querySelector('.temp-btn:first-of-type');
        const increaseBtn = zoneElement.querySelector('.temp-btn:last-of-type');
        const display = zoneElement.querySelector('.temp-value');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const key = zone + 'Temp';
                if (this.state[key] > 60) {
                    this.state[key]--;
                    this.updateTempDisplay(zone);
                    this.saveState();
                }
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const key = zone + 'Temp';
                if (this.state[key] < 85) {
                    this.state[key]++;
                    this.updateTempDisplay(zone);
                    this.saveState();
                }
            });
        }
    }
    
    updateTempDisplay(zone) {
        const zoneElement = document.querySelector(`.climate-zone:${zone === 'driver' ? 'first' : 'last'}-child`);
        if (!zoneElement) return;
        
        const display = zoneElement.querySelector('.temp-value');
        if (display) {
            const key = zone + 'Temp';
            display.textContent = `${this.state[key]}°F`;
        }
    }
    
    setupClimateButtons() {
        const buttons = [
            { id: 'auto-btn', stateKey: 'auto' },
            { id: 'ac-btn', stateKey: 'ac' },
            { id: 'dual-btn', stateKey: 'dualZone' },
            { id: 'recirc-btn', stateKey: 'recirculate' },
            { id: 'defrost-btn', stateKey: 'defrost' },
            { id: 'rear-defrost-btn', stateKey: 'rearDefrost' }
        ];
        
        buttons.forEach(({ id, stateKey }) => {
            const btn = document.getElementById(id);
            if (btn) {
                // Remove any existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add new listener
                newBtn.addEventListener('click', () => {
                    this.state[stateKey] = !this.state[stateKey];
                    newBtn.classList.toggle('active', this.state[stateKey]);
                    this.saveState();
                    
                    // Special handling for AUTO mode
                    if (stateKey === 'auto' && this.state.auto) {
                        this.state.ac = true;
                        document.getElementById('ac-btn')?.classList.add('active');
                    }
                });
            }
        });
    }
    
    setupFanControl() {
        const fanSlider = document.querySelector('.fan-slider');
        if (fanSlider) {
            fanSlider.addEventListener('input', (e) => {
                this.state.fanSpeed = parseInt(e.target.value);
                this.saveState();
            });
        }
    }
    
    setupSeatControls() {
        const zones = ['driver', 'passenger'];
        const types = ['heated', 'cooled'];
        
        zones.forEach((zone, zoneIndex) => {
            const zoneElement = document.querySelector(`.climate-zone:${zoneIndex === 0 ? 'first' : 'last'}-child`);
            if (!zoneElement) return;
            
            const buttons = zoneElement.querySelectorAll('.seat-btn');
            buttons.forEach((btn, btnIndex) => {
                const isHeat = btnIndex === 0;
                const stateKey = isHeat ? 
                    `seatHeat${zone.charAt(0).toUpperCase() + zone.slice(1)}` : 
                    `seatCool${zone.charAt(0).toUpperCase() + zone.slice(1)}`;
                
                // Remove existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', () => {
                    this.state[stateKey] = !this.state[stateKey];
                    newBtn.classList.toggle('active', this.state[stateKey]);
                    
                    // Add specific classes for styling
                    if (isHeat) {
                        newBtn.classList.toggle('active-heated', this.state[stateKey]);
                    } else {
                        newBtn.classList.toggle('active-cooled', this.state[stateKey]);
                    }
                    
                    // Turn off opposite (can't heat and cool at same time)
                    const oppositeKey = isHeat ? 
                        `seatCool${zone.charAt(0).toUpperCase() + zone.slice(1)}` : 
                        `seatHeat${zone.charAt(0).toUpperCase() + zone.slice(1)}`;
                    
                    if (this.state[stateKey] && this.state[oppositeKey]) {
                        this.state[oppositeKey] = false;
                        const oppositeBtn = zoneElement.querySelector(`.seat-btn:${isHeat ? 'last' : 'first'}-of-type`);
                        if (oppositeBtn) {
                            oppositeBtn.classList.remove('active');
                            oppositeBtn.classList.remove(isHeat ? 'active-cooled' : 'active-heated');
                        }
                    }
                    
                    this.saveState();
                });
            });
        });
    }
    
    loadState(climateData) {
        if (!climateData) return;
        
        // Update internal state
        Object.assign(this.state, climateData);
        
        // Update UI
        this.updateAllUI();
    }
    
    updateAllUI() {
        // Update temperatures
        this.updateTempDisplay('driver');
        this.updateTempDisplay('passenger');
        
        // Update climate buttons
        const buttons = [
            { id: 'auto-btn', stateKey: 'auto' },
            { id: 'ac-btn', stateKey: 'ac' },
            { id: 'dual-btn', stateKey: 'dualZone' },
            { id: 'recirc-btn', stateKey: 'recirculate' },
            { id: 'defrost-btn', stateKey: 'defrost' },
            { id: 'rear-defrost-btn', stateKey: 'rearDefrost' }
        ];
        
        buttons.forEach(({ id, stateKey }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.toggle('active', this.state[stateKey]);
            }
        });
        
        // Update fan speed
        const fanSlider = document.querySelector('.fan-slider');
        if (fanSlider) {
            fanSlider.value = this.state.fanSpeed;
        }
        
        // Update seat controls
        const driverZone = document.querySelector('.climate-zone:first-child');
        const passengerZone = document.querySelector('.climate-zone:last-child');
        
        if (driverZone) {
            const heatBtn = driverZone.querySelector('.seat-btn:first-of-type');
            const coolBtn = driverZone.querySelector('.seat-btn:last-of-type');
            if (heatBtn) {
                heatBtn.classList.toggle('active', this.state.seatHeatDriver);
                heatBtn.classList.toggle('active-heated', this.state.seatHeatDriver);
            }
            if (coolBtn) {
                coolBtn.classList.toggle('active', this.state.seatCoolDriver);
                coolBtn.classList.toggle('active-cooled', this.state.seatCoolDriver);
            }
        }
        
        if (passengerZone) {
            const heatBtn = passengerZone.querySelector('.seat-btn:first-of-type');
            const coolBtn = passengerZone.querySelector('.seat-btn:last-of-type');
            if (heatBtn) {
                heatBtn.classList.toggle('active', this.state.seatHeatPassenger);
                heatBtn.classList.toggle('active-heated', this.state.seatHeatPassenger);
            }
            if (coolBtn) {
                coolBtn.classList.toggle('active', this.state.seatCoolPassenger);
                coolBtn.classList.toggle('active-cooled', this.state.seatCoolPassenger);
            }
        }
    }
    
    saveState() {
        // Update global state
        window.climateState = this.state;
        
        // Save to driver profile
        if (window.driverProfileManager) {
            window.driverProfileManager.onSettingChanged();
        }
    }
}

// Initialize climate manager
window.climateManager = new ClimateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClimateManager;
}