// Update time and date
function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    timeElement.textContent = `${displayHours}:${minutes} ${ampm}`;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateElement.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime();

// Navigation between screens
const navButtons = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetScreen = button.getAttribute('data-screen');
        
        // Remove active class from all buttons and screens
        navButtons.forEach(btn => btn.classList.remove('active'));
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Add active class to clicked button and corresponding screen
        button.classList.add('active');
        document.getElementById(`${targetScreen}-screen`).classList.add('active');
    });
});

// Media player functionality
let isPlaying = false;
const playBtn = document.querySelector('.main-btn');
const progressBar = document.querySelector('.progress');
let progressInterval;

playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        simulateProgress();
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(progressInterval);
    }
});

function simulateProgress() {
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 0.5;
        if (progress > 100) {
            progress = 0;
        }
        progressBar.style.width = progress + '%';
    }, 100);
}

// Volume control
const volumeSlider = document.querySelector('.volume-slider');
volumeSlider.addEventListener('input', (e) => {
    console.log('Volume:', e.target.value);
});

// Climate control
let dualMode = false;
const dualBtn = document.getElementById('dual-btn');

// Temperature synchronization
const syncTemperatures = (newTemp) => {
    document.querySelectorAll('.temp-value').forEach(display => {
        display.textContent = newTemp + '°F';
    });
};

const tempBtns = document.querySelectorAll('.temp-btn');
tempBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tempDisplay = btn.parentElement.querySelector('.temp-value');
        const currentTemp = parseInt(tempDisplay.textContent);
        let newTemp;
        
        if (btn.innerHTML.includes('plus')) {
            newTemp = Math.min(currentTemp + 1, 85);
        } else {
            newTemp = Math.max(currentTemp - 1, 60);
        }
        
        if (dualMode) {
            // Sync both sides when in dual mode
            syncTemperatures(newTemp);
        } else {
            // Only update the clicked side
            tempDisplay.textContent = newTemp + '°F';
        }
    });
});

// Dual button functionality
if (dualBtn) {
    dualBtn.addEventListener('click', () => {
        dualMode = !dualMode;
        dualBtn.classList.toggle('active');
        
        if (dualMode) {
            // When activating dual mode, sync to driver's temperature
            const driverTemp = parseInt(document.querySelector('.climate-zone:first-child .temp-value').textContent);
            syncTemperatures(driverTemp);
            
            // Visual indicator
            dualBtn.style.background = '#00ff00';
        } else {
            // Reset visual indicator
            dualBtn.style.background = '';
        }
    });
}

// Climate buttons
const climateBtns = document.querySelectorAll('.climate-btn');
climateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
    });
});

// Seat controls
const seatBtns = document.querySelectorAll('.seat-btn');
seatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.innerHTML.includes('Cooled')) {
            btn.classList.toggle('active-cooled');
        } else {
            // Heated buttons stay red
            btn.style.background = btn.style.background === 'rgb(255, 0, 0)' ? 
                'rgba(255, 255, 255, 0.1)' : '#ff0000';
        }
    });
});

// Fan speed
const fanSlider = document.querySelector('.fan-slider');
fanSlider.addEventListener('input', (e) => {
    console.log('Fan speed:', e.target.value);
});

// Media source buttons
const sourceBtns = document.querySelectorAll('.source-btn');
sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sourceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update now playing based on source
        const trackInfo = document.querySelector('.track-info h2');
        const trackArtist = document.querySelector('.track-info p');
        
        switch(btn.textContent) {
            case 'Radio':
                trackInfo.textContent = 'FM 101.5';
                trackArtist.textContent = 'Local Radio Station';
                break;
            case 'Bluetooth':
                trackInfo.textContent = 'Waiting for device...';
                trackArtist.textContent = 'Connect your phone';
                break;
            case 'USB':
                trackInfo.textContent = 'No USB connected';
                trackArtist.textContent = 'Insert USB device';
                break;
            case 'Spotify':
                trackInfo.textContent = 'Spotify Premium';
                trackArtist.textContent = 'Sign in to continue';
                break;
        }
    });
});

// Removed widget click handlers - widgets no longer exist

// Sound System
class SoundManager {
    constructor() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        
        // Load saved sound preference
        const savedSoundState = localStorage.getItem('touchSounds');
        this.enabled = savedSoundState !== 'false';
    }
    
    playClick() {
        if (!this.enabled) return;
        
        try {
            // Create a simple click sound using Web Audio API
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 1000; // Frequency in Hz
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio playback failed:', error);
        }
    }
    
    playBeep() {
        if (!this.enabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        } catch (error) {
            console.log('Audio playback failed:', error);
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('touchSounds', enabled);
    }
}

// Initialize sound manager
const soundManager = new SoundManager();

// Add click sound to ALL clickable elements
document.addEventListener('click', (e) => {
    // Check if clicked element is any type of button or has button-like behavior
    if (e.target.matches('button, input[type="checkbox"], input[type="range"], select, .toggle-switch, .toggle-slider, .clickable-stat') || 
        e.target.closest('button, .nav-btn, .toggle-switch, .clickable-stat')) {
        soundManager.playClick();
    }
});

// Add hover effects to interactive elements (visual only, no sound)
const allButtons = document.querySelectorAll('button');
allButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});

// Initialize tooltips for status icons
const statusIcons = document.querySelectorAll('.status-right i');
const tooltips = ['Signal Strength', 'Bluetooth Connected', 'WiFi Connected'];
statusIcons.forEach((icon, index) => {
    icon.title = tooltips[index];
});

// Performance Metrics Simulation
function updatePerformanceMetrics() {
    // Boost pressure (0-20 PSI, varies more dynamically)
    const boostGauge = document.querySelector('#boost-gauge .gauge-value');
    if (boostGauge) {
        const currentBoost = parseFloat(boostGauge.textContent);
        const targetBoost = Math.random() * 15;
        const newBoost = currentBoost + (targetBoost - currentBoost) * 0.1;
        boostGauge.textContent = newBoost.toFixed(1);
    }

    // Oil temperature (gradually increases to 220°F)
    const oilTempGauge = document.querySelector('#oil-temp-gauge .gauge-value');
    if (oilTempGauge) {
        const currentOilTemp = parseInt(oilTempGauge.textContent);
        if (currentOilTemp < 220) {
            oilTempGauge.textContent = Math.min(currentOilTemp + 1, 220);
        }
    }

    // Coolant temperature (stabilizes around 195°F)
    const coolantGauge = document.querySelector('#coolant-gauge .gauge-value');
    if (coolantGauge) {
        const currentCoolant = parseInt(coolantGauge.textContent);
        const targetCoolant = 195 + (Math.random() - 0.5) * 10;
        const newCoolant = Math.round(currentCoolant + (targetCoolant - currentCoolant) * 0.05);
        coolantGauge.textContent = newCoolant;
    }

    // Intake air temperature (varies with conditions)
    const intakeGauge = document.querySelector('#intake-gauge .gauge-value');
    if (intakeGauge) {
        const currentIntake = parseInt(intakeGauge.textContent);
        const targetIntake = 75 + (Math.random() - 0.5) * 20;
        const newIntake = Math.round(currentIntake + (targetIntake - currentIntake) * 0.1);
        intakeGauge.textContent = newIntake;
    }
}

// Update metrics every 500ms
setInterval(updatePerformanceMetrics, 500);

// Tire Pressure Monitoring
const tirePressures = {
    'fl': 32,
    'fr': 32,
    'rl': 31,
    'rr': 32
};

function updateTirePressure() {
    let allOk = true;
    
    Object.keys(tirePressures).forEach(position => {
        // Simulate small pressure variations
        const variation = (Math.random() - 0.5) * 2; // ±1 PSI variation
        tirePressures[position] = Math.round(Math.max(28, Math.min(34, tirePressures[position] + variation)));
        
        // Update display if overlay is open
        const psiElement = document.getElementById(`${position}-psi`);
        if (psiElement) {
            psiElement.textContent = tirePressures[position];
            
            // Check for low pressure
            const tireBox = psiElement.closest('.tire-box');
            if (tirePressures[position] < 30) {
                tireBox.classList.add('low-pressure');
                allOk = false;
            } else {
                tireBox.classList.remove('low-pressure');
            }
        }
    });
    
    // Update main card status
    const statusText = document.querySelector('#tire-pressure-card p');
    if (statusText) {
        statusText.textContent = allOk ? 'All tires OK' : 'Low pressure detected';
        if (!allOk) {
            statusText.style.color = '#ff9900';
        } else {
            statusText.style.color = '';
        }
    }
}

// Stat Card Overlays
function setupStatOverlay(cardId, overlayId) {
    const card = document.getElementById(cardId);
    const overlay = document.getElementById(overlayId);
    
    if (card && overlay) {
        card.addEventListener('click', () => {
            overlay.classList.add('active');
            if (cardId === 'tire-pressure-card') {
                updateTirePressure(); // Update values when opening
            }
        });
        
        // Close button
        const closeBtn = overlay.querySelector('.close-overlay');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
            });
        }
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    }
}

// Setup all stat overlays
setupStatOverlay('tire-pressure-card', 'tire-pressure-overlay');
setupStatOverlay('odometer-card', 'odometer-overlay');
setupStatOverlay('fuel-card', 'fuel-overlay');
setupStatOverlay('oil-card', 'oil-overlay');

// Update odometer periodically
function updateOdometer() {
    const odometerValue = document.getElementById('odometer-value');
    const odometerCard = document.querySelector('#odometer-card p');
    if (odometerValue && odometerCard) {
        const currentMiles = parseInt(odometerValue.textContent.replace(',', ''));
        const newMiles = currentMiles + Math.floor(Math.random() * 2); // Simulate driving
        const formattedMiles = newMiles.toLocaleString();
        odometerValue.textContent = formattedMiles;
        odometerCard.textContent = `${formattedMiles} miles`;
    }
}

// Update fuel level
function updateFuelLevel() {
    const fuelFill = document.querySelector('.fuel-fill');
    const fuelCard = document.querySelector('#fuel-card p');
    if (fuelFill && fuelCard) {
        const currentPercent = parseInt(fuelFill.style.width);
        const newPercent = Math.max(0, currentPercent - Math.random() * 0.1); // Slowly decrease
        fuelFill.style.width = newPercent + '%';
        const range = Math.round(newPercent * 4.94); // Approximate range calculation
        fuelCard.textContent = `${Math.round(newPercent)}% - ${range} mi range`;
    }
}

// Update periodically
setInterval(updateOdometer, 30000); // Every 30 seconds
setInterval(updateFuelLevel, 60000); // Every minute

// Update tire pressure every 5 seconds
setInterval(updateTirePressure, 5000);

// Lap Timer Functionality
let lapTimerInterval;
let startTime;
let bestLapTime = null;

const lapTimeDisplay = document.getElementById('lap-time');
const startLapBtn = document.getElementById('start-lap');
const resetLapBtn = document.getElementById('reset-lap');
const bestTimeDisplay = document.getElementById('best-time');

if (startLapBtn && resetLapBtn) {
    startLapBtn.addEventListener('click', () => {
        if (startLapBtn.textContent === 'Start') {
            startTime = Date.now();
            startLapBtn.textContent = 'Stop';
            startLapBtn.classList.add('active');
            
            lapTimerInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                const hundredths = Math.floor((elapsed % 1000) / 10);
                
                lapTimeDisplay.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
            }, 10);
        } else {
            clearInterval(lapTimerInterval);
            startLapBtn.textContent = 'Start';
            startLapBtn.classList.remove('active');
            
            // Check if this is the best lap
            const currentTime = lapTimeDisplay.textContent;
            if (!bestLapTime || currentTime < bestLapTime) {
                bestLapTime = currentTime;
                bestTimeDisplay.textContent = bestLapTime;
            }
        }
    });

    resetLapBtn.addEventListener('click', () => {
        clearInterval(lapTimerInterval);
        lapTimeDisplay.textContent = '00:00.00';
        startLapBtn.textContent = 'Start';
        startLapBtn.classList.remove('active');
    });
}

// Drive mode functionality removed with Quick Settings

// Simulate some animations on load
window.addEventListener('load', () => {
    document.querySelector('.infotainment-container').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.infotainment-container').style.transition = 'opacity 1s ease';
        document.querySelector('.infotainment-container').style.opacity = '1';
    }, 100);
});

// Theme Management - needs to run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const themeSelect = document.getElementById('theme-select');
    const nightModeToggle = document.getElementById('night-mode');
    
    if (themeSelect) {
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        themeSelect.value = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
        
        // Set night mode toggle based on theme
        if (nightModeToggle) {
            nightModeToggle.checked = savedTheme === 'dark';
        }
        
        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value.toLowerCase();
            
            // Handle auto theme based on time
            if (theme === 'auto') {
                const hour = new Date().getHours();
                const autoTheme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
                document.body.setAttribute('data-theme', autoTheme);
                if (nightModeToggle) {
                    nightModeToggle.checked = autoTheme === 'dark';
                }
            } else {
                document.body.setAttribute('data-theme', theme);
                if (nightModeToggle) {
                    nightModeToggle.checked = theme === 'dark';
                }
            }
            
            localStorage.setItem('theme', theme);
        });
    }
    
    if (nightModeToggle) {
        nightModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            if (themeSelect) {
                themeSelect.value = newTheme.charAt(0).toUpperCase() + newTheme.slice(1);
            }
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Touch Sounds Toggle
    const touchSoundsToggle = document.getElementById('touch-sounds');
    if (touchSoundsToggle) {
        // Set initial state
        touchSoundsToggle.checked = soundManager.enabled;
        
        touchSoundsToggle.addEventListener('change', (e) => {
            soundManager.setEnabled(e.target.checked);
        });
    }
    
    // Brightness Control
    const brightnessSlider = document.getElementById('brightness-slider');
    if (brightnessSlider) {
        // Load saved brightness or default to 80
        const savedBrightness = localStorage.getItem('brightness') || '80';
        brightnessSlider.value = savedBrightness;
        updateBrightness(savedBrightness);
        
        brightnessSlider.addEventListener('input', (e) => {
            const brightness = e.target.value;
            updateBrightness(brightness);
            localStorage.setItem('brightness', brightness);
            
            // Update the display value
            const brightnessValue = document.getElementById('brightness-value');
            if (brightnessValue) {
                brightnessValue.textContent = brightness + '%';
            }
        });
    }
});

// Function to update display brightness
function updateBrightness(value) {
    // Convert 20-100 range to 0.4-1.0 opacity range
    const opacity = 0.4 + (value / 100) * 0.6;
    
    // Apply brightness filter to the entire interface
    const container = document.querySelector('.infotainment-container');
    if (container) {
        container.style.filter = `brightness(${value}%)`;
    }
}