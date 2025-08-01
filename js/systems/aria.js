// Audi AI Voice Assistant
class AudiAI {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.recordBtn = document.getElementById('record-btn');
        this.statusText = document.getElementById('ai-status-text');
        this.aiCircleOuter = document.querySelector('.ai-circle-outer');
        this.aiCircleInner = document.querySelector('.ai-circle-inner');
        
        this.initializeSpeechRecognition();
        this.setupEventListeners();
        this.initializeFloatingBubbles();
    }
    
    initializeSpeechRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.lang = 'en-US';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.recordBtn.classList.add('recording');
                this.statusText.textContent = 'Listening...';
                this.animateListening(true);
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                
                if (event.results[0].isFinal) {
                    this.statusText.textContent = `"${transcript}"`;
                    this.processCommand(transcript);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'network') {
                    this.statusText.textContent = 'Speech recognition requires internet connection';
                } else if (event.error === 'not-allowed') {
                    this.statusText.textContent = 'Microphone permission denied';
                } else {
                    this.statusText.textContent = 'Error: ' + event.error;
                }
                this.stopRecording();
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            this.statusText.textContent = 'Speech recognition not supported';
            this.recordBtn.disabled = true;
        }
    }
    
    setupEventListeners() {
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => {
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            });
            
            // Add keyboard shortcut for testing (press 'T' to test)
            document.addEventListener('keypress', (e) => {
                if (e.key === 't' || e.key === 'T') {
                    this.testCommand();
                }
            });
        }
        
        // Text input fallback
        const textInput = document.getElementById('ai-text-input');
        const sendBtn = document.getElementById('ai-send-btn');
        
        if (sendBtn && textInput) {
            sendBtn.addEventListener('click', () => {
                const command = textInput.value.trim();
                if (command) {
                    this.statusText.textContent = `"${command}"`;
                    this.processCommand(command);
                    textInput.value = '';
                }
            });
            
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendBtn.click();
                }
            });
        }
    }
    
    testCommand() {
        // Test command without speech recognition
        const testCommands = [
            "What's my tire pressure?",
            "Show me the fuel level",
            "Check oil life",
            "Navigate to the nearest gas station"
        ];
        const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)];
        
        this.statusText.textContent = `Testing: "${randomCommand}"`;
        this.processCommand(randomCommand);
    }
    
    startRecording() {
        if (this.recognition) {
            // Play sound effect
            if (window.soundManager) {
                window.soundManager.playBeep();
            }
            
            this.recognition.start();
        }
    }
    
    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isRecording = false;
        this.recordBtn.classList.remove('recording');
        this.animateListening(false);
        
        // Reset status after a delay
        setTimeout(() => {
            if (!this.isRecording) {
                this.statusText.textContent = 'Tap to speak';
            }
        }, 3000);
    }
    
    animateListening(start) {
        if (start) {
            this.aiCircleOuter.style.animation = 'pulse-outer 1s ease-in-out infinite';
            this.aiCircleInner.style.animation = 'pulse-inner 1s ease-in-out infinite';
        } else {
            this.aiCircleOuter.style.animation = 'pulse-outer 2s ease-in-out infinite';
            this.aiCircleInner.style.animation = 'pulse-inner 2s ease-in-out infinite';
        }
    }
    
    async processCommand(command) {
        try {
            // Try to use Claude API first
            const response = await fetch('http://localhost:3001/api/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Speak Claude's response
                this.speak(data.response);
                this.statusText.textContent = 'Processing...';
                
                // Execute the suggested action
                if (data.action) {
                    setTimeout(() => {
                        this.executeAction(data.action, data.parameters);
                    }, 1000);
                }
            } else {
                // Fallback to local processing
                this.processCommandLocally(command);
            }
        } catch (error) {
            console.log('Claude API not available, using local processing');
            // Fallback to local command processing
            this.processCommandLocally(command);
        }
    }
    
    executeAction(action, parameters = {}) {
        switch(action) {
            case 'tire_pressure':
                this.executeTirePressureCommand();
                break;
            case 'fuel_level':
                this.executeFuelCommand();
                break;
            case 'oil_life':
                this.executeOilCommand();
                break;
            case 'odometer':
                this.executeOdometerCommand();
                break;
            case 'climate_set':
                if (parameters.temperature) {
                    this.executeClimateCommand(`set temperature to ${parameters.temperature} degrees`);
                }
                break;
            case 'climate_auto':
                this.navigateToScreen('climate');
                setTimeout(() => {
                    const autoBtn = document.getElementById('auto-btn');
                    if (autoBtn && !autoBtn.classList.contains('active')) {
                        autoBtn.click();
                    }
                }, 500);
                break;
            case 'seat_heat':
            case 'seat_cool':
                this.navigateToScreen('climate');
                setTimeout(() => {
                    const seatBtns = document.querySelectorAll('.seat-btn');
                    const targetBtn = Array.from(seatBtns).find(btn => 
                        action === 'seat_heat' ? btn.innerHTML.includes('Heated') : btn.innerHTML.includes('Cooled')
                    );
                    if (targetBtn) targetBtn.click();
                }, 500);
                break;
            case 'music_play':
                this.executeMusicCommand();
                break;
            case 'music_next':
            case 'music_prev':
                this.navigateToScreen('media');
                setTimeout(() => {
                    const btn = document.querySelector(action === 'music_next' ? '.fa-step-forward' : '.fa-step-backward');
                    if (btn) btn.parentElement.click();
                }, 500);
                break;
            case 'volume_set':
                if (parameters.level !== undefined) {
                    this.navigateToScreen('media');
                    setTimeout(() => {
                        const volumeSlider = document.querySelector('.volume-slider');
                        if (volumeSlider) {
                            volumeSlider.value = parameters.level;
                            volumeSlider.dispatchEvent(new Event('input'));
                        }
                    }, 500);
                }
                break;
            case 'navigate':
                this.executeNavigationCommand(parameters.destination || '');
                break;
            case 'navigate_home':
                this.navigateToScreen('navigation');
                setTimeout(() => {
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.value = 'home';
                        const searchBtn = document.querySelector('.search-btn');
                        if (searchBtn) searchBtn.click();
                    }
                }, 500);
                break;
            case 'navigate_work':
                this.navigateToScreen('navigation');
                setTimeout(() => {
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.value = 'work';
                        const searchBtn = document.querySelector('.search-btn');
                        if (searchBtn) searchBtn.click();
                    }
                }, 500);
                break;
            case 'home_screen':
                this.executeHomeCommand();
                break;
            case 'settings':
                this.navigateToScreen('settings');
                break;
            case 'phone':
                this.navigateToScreen('phone');
                break;
            case 'brightness_set':
                if (parameters.level !== undefined) {
                    this.navigateToScreen('settings');
                    setTimeout(() => {
                        const brightnessSlider = document.getElementById('brightness-slider');
                        if (brightnessSlider) {
                            brightnessSlider.value = parameters.level;
                            brightnessSlider.dispatchEvent(new Event('input'));
                        }
                    }, 500);
                }
                break;
            case 'theme_set':
                if (parameters.theme) {
                    this.navigateToScreen('settings');
                    setTimeout(() => {
                        const themeSelect = document.getElementById('theme-select');
                        if (themeSelect) {
                            themeSelect.value = parameters.theme.charAt(0).toUpperCase() + parameters.theme.slice(1);
                            themeSelect.dispatchEvent(new Event('change'));
                        }
                    }, 500);
                }
                break;
        }
    }
    
    processCommandLocally(command) {
        // Local fallback processing
        if (command.includes('tire pressure') || command.includes('tyre pressure')) {
            this.executeTirePressureCommand();
        } else if (command.includes('fuel') || command.includes('gas')) {
            this.executeFuelCommand();
        } else if (command.includes('oil')) {
            this.executeOilCommand();
        } else if (command.includes('odometer') || command.includes('mileage')) {
            this.executeOdometerCommand();
        } else if (command.includes('temperature') || command.includes('climate')) {
            this.executeClimateCommand(command);
        } else if (command.includes('music') || command.includes('play')) {
            this.executeMusicCommand();
        } else if (command.includes('navigate') || command.includes('directions')) {
            this.executeNavigationCommand(command);
        } else if (command.includes('home')) {
            this.executeHomeCommand();
        } else {
            this.statusText.textContent = 'Command not recognized';
            this.speak('Sorry, I didn\'t understand that command.');
        }
    }
    
    executeTirePressureCommand() {
        this.statusText.textContent = 'Opening tire pressure...';
        this.speak('Checking tire pressure');
        
        // Open tire pressure overlay
        const overlay = document.getElementById('tire-pressure-overlay');
        if (overlay) {
            overlay.classList.add('active');
            
            // Update tire pressure values
            if (window.updateTirePressure) {
                window.updateTirePressure();
            }
        }
    }
    
    executeFuelCommand() {
        this.statusText.textContent = 'Opening fuel level...';
        this.speak('Checking fuel level');
        
        // Open fuel overlay
        const overlay = document.getElementById('fuel-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    executeOilCommand() {
        this.statusText.textContent = 'Opening oil life...';
        this.speak('Checking oil life');
        
        // Open oil overlay
        const overlay = document.getElementById('oil-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    executeOdometerCommand() {
        this.statusText.textContent = 'Opening odometer...';
        this.speak('Showing odometer');
        
        // Open odometer overlay
        const overlay = document.getElementById('odometer-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }
    
    executeClimateCommand(command) {
        // Extract temperature from command
        const tempMatch = command.match(/(\d+)\s*degrees?/);
        if (tempMatch) {
            const temperature = parseInt(tempMatch[1]);
            this.statusText.textContent = `Setting temperature to ${temperature}°F...`;
            this.speak(`Setting temperature to ${temperature} degrees`);
            
            // Navigate to climate screen
            this.navigateToScreen('climate');
            
            // Set temperature
            setTimeout(() => {
                const tempDisplays = document.querySelectorAll('.temp-value');
                tempDisplays.forEach(display => {
                    display.textContent = temperature + '°F';
                });
            }, 500);
        } else {
            this.navigateToScreen('climate');
            this.speak('Opening climate controls');
        }
    }
    
    executeMusicCommand() {
        this.statusText.textContent = 'Opening media player...';
        this.speak('Opening media player');
        this.navigateToScreen('media');
        
        // Auto-play music
        setTimeout(() => {
            const playBtn = document.querySelector('.main-btn');
            if (playBtn && !window.isPlaying) {
                playBtn.click();
            }
        }, 500);
    }
    
    executeNavigationCommand(command) {
        this.statusText.textContent = 'Opening navigation...';
        this.navigateToScreen('navigation');
        
        // Extract destination if mentioned
        if (command.includes('gas station') || command.includes('petrol station')) {
            this.speak('Finding nearest gas station');
            setTimeout(() => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = 'gas station near me';
                    const searchBtn = document.querySelector('.search-btn');
                    if (searchBtn) searchBtn.click();
                }
            }, 500);
        } else {
            this.speak('Opening navigation');
        }
    }
    
    executeHomeCommand() {
        this.statusText.textContent = 'Going home...';
        this.speak('Going to home screen');
        this.navigateToScreen('home');
    }
    
    navigateToScreen(screenName) {
        // Find and click the appropriate nav button
        const navBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (navBtn) {
            navBtn.click();
        }
    }
    
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            // Try to use a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.name.includes('Female') || 
                voice.name.includes('Samantha') || 
                voice.name.includes('Victoria')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    initializeFloatingBubbles() {
        this.bubbleContainer = document.getElementById('floating-bubbles');
        if (!this.bubbleContainer) return;
        
        this.bubbleCommands = [
            // Vehicle Status Commands
            "What's my tire pressure?",
            "How's my fuel level?",
            "Check my oil life",
            "Show odometer",
            "How's my car doing?",
            "Show vehicle info",
            
            // Climate Commands  
            "I'm cold",
            "I'm hot",
            "Set temperature to 70",
            "Set temperature to 75",
            "Turn on heated seats",
            "Turn on cooled seats",
            "Turn on auto climate",
            "Turn on AC",
            
            // Media Commands
            "Play some music",
            "Pause music",
            "Play next song",
            "Play previous song",
            "Turn up the volume",
            "Turn down the volume",
            "Set volume to 50",
            
            // Navigation Commands
            "Navigate home",
            "Navigate to work",
            "Navigate to coffee shop",
            "Navigate to gas station",
            "Navigate to restaurant",
            "Show me navigation",
            
            // Settings Commands
            "Switch to light mode",
            "Switch to dark mode",
            "Make it brighter",
            "Make it dimmer",
            "Set brightness to 80",
            "Show me the settings",
            "Turn on touch sounds",
            "Turn off touch sounds",
            
            // Screen Navigation
            "Go to home screen",
            "Show phone screen",
            "Open media player",
            "Open climate controls",
            
            // General Commands
            "What can you do?",
            "Help me",
            "Show all features",
            "Tell me a joke",
            
            // Additional Media Commands
            "Switch to Bluetooth",
            "Switch to USB",
            "Switch to radio",
            "Mute volume",
            "Set volume to 75",
            "Pause the music",
            
            // Additional Climate Commands
            "Set temperature to 68",
            "Turn off heated seats",
            "Turn off AC",
            
            // Additional Settings Commands
            "Set brightness to 50",
            "Set brightness to 100",
            "Switch to auto theme",
            
            // Vehicle Commands
            "Show performance data",
            "Start lap timer",
            "Reset lap timer",
            
            // Phone Commands
            "Show recent calls",
            "Connect Bluetooth device"
        ];
        
        this.animations = ['float-right', 'float-left', 'float-up', 'float-down', 'float-diagonal-up', 'float-diagonal-down'];
        this.activeBubbles = new Set();
        this.recentPositions = []; // Track recent spawn positions to avoid overlap
        
        // Start creating bubbles
        this.startBubbleGeneration();
    }
    
    startBubbleGeneration() {
        // Create initial bubbles quickly
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBubble();
            }, i * 200);
        }
        
        // Create new bubbles very frequently to fill the screen
        setInterval(() => {
            if (this.activeBubbles.size < 30) { // Many more bubbles on screen
                this.createBubble();
            }
        }, Math.random() * 400 + 300); // Every 0.3-0.7 seconds
        
        // Secondary bubble generator for extra density
        setInterval(() => {
            if (this.activeBubbles.size < 25) {
                this.createBubble();
            }
        }, Math.random() * 500 + 400); // Every 0.4-0.9 seconds
    }
    
    createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        
        // Random command
        const command = this.bubbleCommands[Math.floor(Math.random() * this.bubbleCommands.length)];
        bubble.textContent = command;
        
        // Random animation
        const animation = this.animations[Math.floor(Math.random() * this.animations.length)];
        bubble.style.animationName = animation;
        
        // Random starting position based on animation (with collision avoidance)
        this.setRandomPosition(bubble, animation);
        
        // Click handler
        bubble.addEventListener('click', (e) => {
            e.stopPropagation();
            this.executeBubbleCommand(command);
            this.removeBubble(bubble);
        });
        
        // Add to container
        this.bubbleContainer.appendChild(bubble);
        this.activeBubbles.add(bubble);
        
        // Remove after animation completes
        setTimeout(() => {
            this.removeBubble(bubble);
        }, 15000);
    }
    
    setRandomPosition(bubble, animation) {
        const containerHeight = this.bubbleContainer.offsetHeight;
        const containerWidth = this.bubbleContainer.offsetWidth;
        let position = {};
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
            attempts++;
            switch(animation) {
                case 'float-right':
                    position = {
                        top: Math.random() * (containerHeight - 150) + 75, // Stay away from ARIA title
                        left: -150
                    };
                    break;
                case 'float-left':
                    position = {
                        top: Math.random() * (containerHeight - 150) + 75,
                        left: containerWidth + 50
                    };
                    break;
                case 'float-up':
                    position = {
                        top: containerHeight + 50,
                        left: Math.random() * (containerWidth - 200) + 100
                    };
                    break;
                case 'float-down':
                    position = {
                        top: -100,
                        left: Math.random() * (containerWidth - 200) + 100
                    };
                    break;
                case 'float-diagonal-up':
                    position = {
                        top: containerHeight + 50,
                        left: -150
                    };
                    break;
                case 'float-diagonal-down':
                    position = {
                        top: -100,
                        left: containerWidth + 50
                    };
                    break;
            }
        } while (this.isPositionTooClose(position, animation) && attempts < maxAttempts);
        
        // Apply the position
        bubble.style.top = position.top + 'px';
        bubble.style.left = position.left + 'px';
        
        // Store this position for collision checking
        this.recentPositions.push({
            ...position,
            animation: animation,
            timestamp: Date.now()
        });
        
        // Clean up old positions (older than 3 seconds)
        this.recentPositions = this.recentPositions.filter(pos => 
            Date.now() - pos.timestamp < 3000
        );
    }
    
    isPositionTooClose(newPosition, newAnimation) {
        const minDistance = 100; // Minimum distance between bubbles (reduced for more density)
        
        for (let recentPos of this.recentPositions) {
            // Skip if it's a different animation type (they won't stay overlapped)
            if (this.animationsWillSeparate(newAnimation, recentPos.animation)) {
                continue;
            }
            
            const distance = Math.sqrt(
                Math.pow(newPosition.top - recentPos.top, 2) + 
                Math.pow(newPosition.left - recentPos.left, 2)
            );
            
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }
    
    animationsWillSeparate(anim1, anim2) {
        // Animations that move in different directions will separate naturally
        const separatingPairs = [
            ['float-right', 'float-left'],
            ['float-up', 'float-down'],
            ['float-diagonal-up', 'float-diagonal-down'],
            ['float-right', 'float-up'],
            ['float-right', 'float-down'],
            ['float-left', 'float-up'],
            ['float-left', 'float-down']
        ];
        
        return separatingPairs.some(pair => 
            (pair[0] === anim1 && pair[1] === anim2) || 
            (pair[1] === anim1 && pair[0] === anim2)
        );
    }
    
    removeBubble(bubble) {
        if (this.activeBubbles.has(bubble)) {
            this.activeBubbles.delete(bubble);
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }
    }
    
    executeBubbleCommand(command) {
        // Create a temporary status display
        const statusDisplay = document.createElement('div');
        statusDisplay.textContent = `"${command}"`;
        statusDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(statusDisplay);
        
        // Remove status after 1.5 seconds
        setTimeout(() => {
            if (statusDisplay.parentNode) {
                statusDisplay.parentNode.removeChild(statusDisplay);
            }
        }, 1500);
        
        // Execute command directly for immediate response
        this.executeDirectCommand(command);
    }
    
    executeDirectCommand(command) {
        const cmd = command.toLowerCase();
        
        // Vehicle Status Commands
        if (cmd.includes('tire pressure')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.executeTirePressureCommand(), 500);
        } else if (cmd.includes('fuel level')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.executeFuelCommand(), 500);
        } else if (cmd.includes('oil life')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.executeOilCommand(), 500);
        } else if (cmd.includes('odometer')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.executeOdometerCommand(), 500);
        } else if (cmd.includes('vehicle info')) {
            this.navigateToScreen('vehicle');
        }
        
        // Climate Commands
        else if (cmd.includes("i'm cold") || cmd.includes('cold')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.adjustTemperature(75), 500);
        } else if (cmd.includes("i'm hot") || cmd.includes('hot')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.adjustTemperature(68), 500);
        } else if (cmd.includes('temperature to 70')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.adjustTemperature(70), 500);
        } else if (cmd.includes('temperature to 75')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.adjustTemperature(75), 500);
        } else if (cmd.includes('heated seats')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.activateSeatControl('heated'), 500);
        } else if (cmd.includes('cooled seats')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.activateSeatControl('cooled'), 500);
        } else if (cmd.includes('auto climate')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.activateClimateButton('auto-btn'), 500);
        } else if (cmd.includes('turn on ac')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.activateClimateButton('ac-btn'), 500);
        }
        
        // Media Commands
        else if (cmd.includes('play some music') || cmd.includes('play music')) {
            this.navigateToScreen('media');
            setTimeout(() => this.controlMusic('play'), 500);
        } else if (cmd.includes('pause music')) {
            this.navigateToScreen('media');
            setTimeout(() => this.controlMusic('pause'), 500);
        } else if (cmd.includes('next song')) {
            this.navigateToScreen('media');
            setTimeout(() => this.controlMusic('next'), 500);
        } else if (cmd.includes('previous song')) {
            this.navigateToScreen('media');
            setTimeout(() => this.controlMusic('prev'), 500);
        } else if (cmd.includes('turn up the volume') || cmd.includes('volume up')) {
            this.navigateToScreen('media');
            setTimeout(() => this.adjustVolume('+'), 500);
        } else if (cmd.includes('turn down the volume') || cmd.includes('volume down')) {
            this.navigateToScreen('media');
            setTimeout(() => this.adjustVolume('-'), 500);
        } else if (cmd.includes('volume to 50')) {
            this.navigateToScreen('media');
            setTimeout(() => this.adjustVolume(50), 500);
        }
        
        // Navigation Commands
        else if (cmd.includes('navigate home')) {
            this.navigateToScreen('navigation');
            setTimeout(() => this.searchLocation('home'), 500);
        } else if (cmd.includes('navigate to work')) {
            this.navigateToScreen('navigation');
            setTimeout(() => this.searchLocation('work'), 500);
        } else if (cmd.includes('coffee shop')) {
            this.navigateToScreen('navigation');
            setTimeout(() => this.searchLocation('coffee shop near me'), 500);
        } else if (cmd.includes('gas station')) {
            this.navigateToScreen('navigation');
            setTimeout(() => this.searchLocation('gas station near me'), 500);
        } else if (cmd.includes('restaurant')) {
            this.navigateToScreen('navigation');
            setTimeout(() => this.searchLocation('restaurant near me'), 500);
        } else if (cmd.includes('show me navigation')) {
            this.navigateToScreen('navigation');
        }
        
        // Settings Commands
        else if (cmd.includes('light mode')) {
            this.switchTheme('light');
        } else if (cmd.includes('dark mode')) {
            this.switchTheme('dark');
        } else if (cmd.includes('make it brighter')) {
            this.adjustBrightness('+');
        } else if (cmd.includes('make it dimmer')) {
            this.adjustBrightness('-');
        } else if (cmd.includes('brightness to 80')) {
            this.adjustBrightness(80);
        } else if (cmd.includes('show me the settings')) {
            this.navigateToScreen('settings');
        } else if (cmd.includes('turn on touch sounds')) {
            this.toggleTouchSounds(true);
        } else if (cmd.includes('turn off touch sounds')) {
            this.toggleTouchSounds(false);
        }
        
        // Screen Navigation
        else if (cmd.includes('home screen')) {
            this.navigateToScreen('home');
        } else if (cmd.includes('phone screen')) {
            this.navigateToScreen('phone');
        } else if (cmd.includes('media player')) {
            this.navigateToScreen('media');
        } else if (cmd.includes('climate controls')) {
            this.navigateToScreen('climate');
        }
        
        // Additional Media Commands
        else if (cmd.includes('switch to bluetooth')) {
            this.navigateToScreen('media');
            setTimeout(() => this.switchMediaSource('Bluetooth'), 500);
        } else if (cmd.includes('switch to usb')) {
            this.navigateToScreen('media');
            setTimeout(() => this.switchMediaSource('USB'), 500);
        } else if (cmd.includes('switch to radio')) {
            this.navigateToScreen('media');
            setTimeout(() => this.switchMediaSource('Radio'), 500);
        } else if (cmd.includes('mute volume')) {
            this.navigateToScreen('media');
            setTimeout(() => this.adjustVolume(0), 500);
        } else if (cmd.includes('volume to 75')) {
            this.navigateToScreen('media');
            setTimeout(() => this.adjustVolume(75), 500);
        } else if (cmd.includes('pause the music')) {
            this.navigateToScreen('media');
            setTimeout(() => this.controlMusic('pause'), 500);
        }
        
        // Additional Climate Commands
        else if (cmd.includes('temperature to 68')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.adjustTemperature(68), 500);
        } else if (cmd.includes('turn off heated seats')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.deactivateSeatControl('heated'), 500);
        } else if (cmd.includes('turn off ac')) {
            this.navigateToScreen('climate');
            setTimeout(() => this.deactivateClimateButton('ac-btn'), 500);
        }
        
        // Additional Settings Commands
        else if (cmd.includes('brightness to 50')) {
            this.adjustBrightness(50);
        } else if (cmd.includes('brightness to 100')) {
            this.adjustBrightness(100);
        } else if (cmd.includes('auto theme')) {
            this.switchTheme('auto');
        }
        
        // Vehicle Commands
        else if (cmd.includes('performance data')) {
            this.navigateToScreen('vehicle');
        } else if (cmd.includes('start lap timer')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.controlLapTimer('start'), 500);
        } else if (cmd.includes('reset lap timer')) {
            this.navigateToScreen('vehicle');
            setTimeout(() => this.controlLapTimer('reset'), 500);
        }
        
        // Phone Commands
        else if (cmd.includes('recent calls') || cmd.includes('connect bluetooth device')) {
            this.navigateToScreen('phone');
        }
        
        // General Commands
        else if (cmd.includes('what can you do') || cmd.includes('help') || cmd.includes('features')) {
            this.showHelpInfo();
        } else if (cmd.includes('tell me a joke')) {
            this.tellJoke();
        }
    }
    
    // Helper functions for direct actions
    adjustTemperature(temp) {
        const tempDisplays = document.querySelectorAll('.temp-value');
        tempDisplays.forEach(display => {
            display.textContent = temp + '°F';
        });
    }
    
    activateSeatControl(type) {
        const seatBtns = document.querySelectorAll('.seat-btn');
        const targetBtn = Array.from(seatBtns).find(btn => 
            type === 'heated' ? btn.innerHTML.includes('Heated') : btn.innerHTML.includes('Cooled')
        );
        if (targetBtn) targetBtn.click();
    }
    
    activateClimateButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn && !btn.classList.contains('active')) {
            btn.click();
        }
    }
    
    controlMusic(action) {
        if (action === 'play' || action === 'pause') {
            const playBtn = document.querySelector('.main-btn');
            if (playBtn) playBtn.click();
        } else if (action === 'next') {
            const nextBtn = document.querySelector('.fa-step-forward');
            if (nextBtn) nextBtn.parentElement.click();
        } else if (action === 'prev') {
            const prevBtn = document.querySelector('.fa-step-backward');
            if (prevBtn) prevBtn.parentElement.click();
        }
    }
    
    adjustVolume(value) {
        const volumeSlider = document.querySelector('.volume-slider');
        if (!volumeSlider) return;
        
        if (value === '+') {
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
        } else if (value === '-') {
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
        } else {
            volumeSlider.value = value;
        }
        volumeSlider.dispatchEvent(new Event('input'));
    }
    
    searchLocation(location) {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = location;
            const searchBtn = document.querySelector('.search-btn');
            if (searchBtn) searchBtn.click();
        }
    }
    
    switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = theme.charAt(0).toUpperCase() + theme.slice(1);
            themeSelect.dispatchEvent(new Event('change'));
        }
        localStorage.setItem('theme', theme);
    }
    
    adjustBrightness(value) {
        const brightnessSlider = document.getElementById('brightness-slider');
        if (!brightnessSlider) return;
        
        if (value === '+') {
            brightnessSlider.value = Math.min(100, parseInt(brightnessSlider.value) + 10);
        } else if (value === '-') {
            brightnessSlider.value = Math.max(20, parseInt(brightnessSlider.value) - 10);
        } else {
            brightnessSlider.value = value;
        }
        brightnessSlider.dispatchEvent(new Event('input'));
    }
    
    toggleTouchSounds(enable) {
        const touchSoundsToggle = document.getElementById('touch-sounds');
        if (touchSoundsToggle) {
            touchSoundsToggle.checked = enable;
            touchSoundsToggle.dispatchEvent(new Event('change'));
        }
    }
    
    showHelpInfo() {
        const helpDisplay = document.createElement('div');
        helpDisplay.innerHTML = `
            <h3>I can help you with:</h3>
            <ul>
                <li>Check vehicle status (tire pressure, fuel, oil)</li>
                <li>Control climate (temperature, seats, AC)</li>
                <li>Manage media (play music, volume control)</li>
                <li>Navigate to locations</li>
                <li>Adjust settings (theme, brightness)</li>
                <li>Switch between screens</li>
            </ul>
        `;
        helpDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 1000;
            max-width: 400px;
            text-align: left;
        `;
        
        document.body.appendChild(helpDisplay);
        
        setTimeout(() => {
            if (helpDisplay.parentNode) {
                helpDisplay.parentNode.removeChild(helpDisplay);
            }
        }, 5000);
    }
    
    // Additional helper functions
    switchMediaSource(source) {
        const sourceBtns = document.querySelectorAll('.source-btn');
        sourceBtns.forEach(btn => btn.classList.remove('active'));
        
        const targetBtn = Array.from(sourceBtns).find(btn => btn.textContent === source);
        if (targetBtn) {
            targetBtn.classList.add('active');
            targetBtn.click();
        }
    }
    
    deactivateSeatControl(type) {
        const seatBtns = document.querySelectorAll('.seat-btn');
        const targetBtn = Array.from(seatBtns).find(btn => 
            type === 'heated' ? btn.innerHTML.includes('Heated') : btn.innerHTML.includes('Cooled')
        );
        if (targetBtn && targetBtn.classList.contains('active')) {
            targetBtn.click();
        }
    }
    
    deactivateClimateButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn && btn.classList.contains('active')) {
            btn.click();
        }
    }
    
    controlLapTimer(action) {
        if (action === 'start') {
            const startBtn = document.getElementById('start-lap');
            if (startBtn) startBtn.click();
        } else if (action === 'reset') {
            const resetBtn = document.getElementById('reset-lap');
            if (resetBtn) resetBtn.click();
        }
    }
    
    tellJoke() {
        const jokes = [
            "Why don't cars ever get tired? Because they have spare tires!",
            "What do you call a sleeping bull at a car dealership? A bulldozer!",
            "Why did the car apply for a job? It wanted to quit being a gas guzzler!",
            "What's a car's favorite type of music? Brake beats!",
            "Why don't cars like to race in the rain? They're afraid of hydroplaning their reputation!",
            "What did the traffic light say to the car? Don't look, I'm changing!",
            "Why did the car go to therapy? It had too many breakdowns!",
            "What do you call a car that never stops? A Ford Focus!",
            "Why don't cars make good comedians? Their timing belt is always off!",
            "What's a mechanic's favorite type of music? Heavy metal and brake fluid blues!",
            "Why did the car break up with the motorcycle? It was tired of the relationship being so exhausting!",
            "What do you call a car with no doors? A convertible opportunity!",
            "Why don't cars ever win at poker? They always fold under pressure!",
            "What's a car's favorite day of the week? Sunday drive!",
            "Why did the electric car go to school? To get a higher charge!",
            "What do you call a car that tells jokes? A Honda Civic comedian!",
            "Why don't cars like speed dating? They prefer a slow cruise!",
            "What's a car's favorite exercise? Tire rotations!",
            "Why did the car fail its driving test? It couldn't parallel park its sense of humor!",
            "What do you call a car that's always cold? A Chevy Freeze!"
        ];
        
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        
        const jokeDisplay = document.createElement('div');
        jokeDisplay.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-laugh" style="font-size: 30px; color: #ff0000;"></i>
            </div>
            <p style="font-size: 16px; line-height: 1.4; margin: 0;">${randomJoke}</p>
        `;
        jokeDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 1000;
            max-width: 450px;
            text-align: center;
            border: 2px solid #ff0000;
        `;
        
        document.body.appendChild(jokeDisplay);
        
        setTimeout(() => {
            if (jokeDisplay.parentNode) {
                jokeDisplay.parentNode.removeChild(jokeDisplay);
            }
        }, 4000);
    }
}

// Initialize Audi AI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize when on AI screen
    const aiScreen = document.getElementById('audi-ai-screen');
    if (aiScreen) {
        // Initialize when navigating to AI screen
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (btn.getAttribute('data-screen') === 'audi-ai') {
                btn.addEventListener('click', () => {
                    if (!window.audiAI) {
                        window.audiAI = new AudiAI();
                    }
                });
            }
        });
    }
    
    // Make updateTirePressure globally accessible
    if (typeof updateTirePressure !== 'undefined') {
        window.updateTirePressure = updateTirePressure;
    }
});