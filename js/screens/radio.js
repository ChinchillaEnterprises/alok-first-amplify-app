// Internet Radio Player
class InternetRadio {
    constructor() {
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.isPlaying = false;
        this.currentStationIndex = 0;
        
        // Radio stations organized by genre
        this.stations = [
            // Hip Hop/Urban (1-6)
            {
                name: 'Hot 97 New York',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac',
                genre: 'Hip Hop'
            },
            {
                name: 'Power 106 LA',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRAAC.aac',
                genre: 'Hip Hop'
            },
            {
                name: 'Real 92.3 LA',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KHHTAAC.aac',
                genre: 'Hip Hop/R&B'
            },
            {
                name: 'V-103 Atlanta',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WVEEAAC.aac',
                genre: 'Urban/R&B'
            },
            {
                name: 'Power 98 Charlotte',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WPEGFMAAC.aac',
                genre: 'Urban Contemporary'
            },
            {
                name: 'Boom 107.9 Philly',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WRNBFMAAC.aac',
                genre: 'Classic Hip Hop'
            },
            // Pop/Top 40 (7-9)
            { 
                name: 'BBC Radio 1', 
                url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
                genre: 'Pop/Current Hits'
            },
            {
                name: 'Z100 New York',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WHTZFMAAC.aac',
                genre: 'Top 40/Pop'
            },
            {
                name: 'KISS FM Los Angeles',
                url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KIISFMAAC.aac',
                genre: 'Top 40/Pop'
            },
            // Alternative/Eclectic (10-12)
            { 
                name: 'KEXP 90.3 Seattle', 
                url: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
                genre: 'Alternative'
            },
            { 
                name: 'Radio Paradise', 
                url: 'https://stream.radioparadise.com/aac-320',
                genre: 'Eclectic Mix'
            },
            {
                name: 'SomaFM Groove Salad',
                url: 'https://somafm.com/groovesalad256.pls',
                genre: 'Ambient/Chill'
            },
            // Jazz & Classical (13-14)
            { 
                name: 'Jazz24', 
                url: 'https://live.amperwave.net/direct/ppm-jazz24aac-ibc1',
                genre: 'Jazz'
            },
            { 
                name: 'Classical KING FM', 
                url: 'https://classicalking.streamguys1.com/king-fm-mp3',
                genre: 'Classical'
            },
            // News/Talk (15)
            { 
                name: 'NPR News', 
                url: 'https://npr-ice.streamguys1.com/live.mp3',
                genre: 'News/Talk'
            }
        ];
        
        this.setupAudioEventListeners();
    }
    
    setupAudioEventListeners() {
        this.audio.addEventListener('loadstart', () => {
            this.showLoading();
        });
        
        this.audio.addEventListener('canplay', () => {
            this.hideLoading();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Radio stream error:', e);
            this.showError();
        });
        
        // Handle volume from the existing volume slider
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            this.audio.volume = volumeSlider.value / 100;
        }
    }
    
    async loadStation(index) {
        this.currentStationIndex = index;
        const station = this.stations[index];
        
        try {
            // Stop current stream
            this.audio.pause();
            
            // Handle .pls playlist files
            if (station.url.endsWith('.pls')) {
                const streamUrl = await this.parsePLS(station.url);
                this.audio.src = streamUrl;
            } else {
                this.audio.src = station.url;
            }
            
            // Update UI
            this.updateDisplay(station);
            
            // Auto-play if was playing
            if (this.isPlaying) {
                this.play();
            }
        } catch (error) {
            console.error('Failed to load station:', error);
            this.showError();
        }
    }
    
    async parsePLS(plsUrl) {
        // For .pls files, we need to extract the actual stream URL
        // For now, return known direct URLs for SomaFM stations
        if (plsUrl.includes('groovesalad')) {
            return 'https://ice1.somafm.com/groovesalad-256-mp3';
        } else if (plsUrl.includes('dronezone')) {
            return 'https://ice1.somafm.com/dronezone-256-mp3';
        }
        return plsUrl;
    }
    
    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButton(true);
            this.updateRadioUI(true);
        }).catch(error => {
            console.error('Playback failed:', error);
            this.showError('Click play to start radio');
        });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton(false);
        this.updateRadioUI(false);
    }
    
    updateRadioUI(playing) {
        // Keep progress bar solid red for radio at all times
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.background = '#ff0000';
        }
        
        // Hide shuffle and repeat buttons for radio
        const shuffleBtn = document.querySelector('.media-btn:has(.fa-random)');
        const repeatBtn = document.querySelector('.media-btn:has(.fa-repeat)');
        
        if (shuffleBtn) shuffleBtn.style.display = 'none';
        if (repeatBtn) repeatBtn.style.display = 'none';
    }
    
    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    nextStation() {
        const nextIndex = (this.currentStationIndex + 1) % this.stations.length;
        this.loadStation(nextIndex);
    }
    
    previousStation() {
        const prevIndex = (this.currentStationIndex - 1 + this.stations.length) % this.stations.length;
        this.loadStation(prevIndex);
    }
    
    setVolume(value) {
        this.audio.volume = value / 100;
    }
    
    updateDisplay(station) {
        const nowPlaying = document.querySelector('.now-playing');
        if (!nowPlaying) return;
        
        nowPlaying.innerHTML = `
            <div class="radio-interface">
                <div class="album-art" style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <div class="radio-animation ${this.isPlaying ? 'playing' : ''}">
                        <i class="fas fa-broadcast-tower fa-4x" style="margin-bottom: 10px;"></i>
                        <div class="radio-waves">
                            <div class="wave"></div>
                            <div class="wave"></div>
                            <div class="wave"></div>
                        </div>
                    </div>
                    <div class="station-preset" style="margin-top: 15px; font-size: 48px; font-weight: 300; opacity: 0.8;">
                        ${(this.currentStationIndex + 1).toString().padStart(2, '0')}
                    </div>
                    <div class="station-dots" style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
                        ${this.stations.map((_, i) => 
                            `<div style="width: 8px; height: 8px; border-radius: 50%; 
                                        background: ${i === this.currentStationIndex ? '#ff0000' : 'rgba(255,255,255,0.3)'};">
                            </div>`
                        ).join('')}
                    </div>
                </div>
                <div class="track-info">
                    <h2>${station.name}</h2>
                    <p>${station.genre}</p>
                    <div class="radio-info" style="margin-top: 15px;">
                        <p class="radio-status" style="font-size: 14px; opacity: 0.7; text-align: center;">
                            ${this.isPlaying ? '🔴 LIVE' : 'Press play to start'}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for radio animation
        this.addRadioStyles();
    }
    
    updatePlayButton(playing) {
        const playBtn = document.querySelector('.main-btn i');
        if (playBtn) {
            playBtn.className = playing ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    showLoading() {
        const statusElement = document.querySelector('.radio-status');
        if (statusElement) {
            statusElement.textContent = '⏳ Connecting to stream...';
        }
    }
    
    hideLoading() {
        const statusElement = document.querySelector('.radio-status');
        if (statusElement) {
            statusElement.textContent = '🔴 LIVE';
        }
    }
    
    showError(message = 'Unable to connect to station') {
        const statusElement = document.querySelector('.radio-status');
        if (statusElement) {
            statusElement.textContent = `❌ ${message}`;
        }
    }
    
    addRadioStyles() {
        if (!document.getElementById('radio-styles')) {
            const style = document.createElement('style');
            style.id = 'radio-styles';
            style.textContent = `
                .radio-animation {
                    position: relative;
                }
                
                .radio-waves {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }
                
                .radio-waves .wave {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border: 2px solid #ff0000;
                    border-radius: 50%;
                    opacity: 0;
                    animation: radioWave 3s infinite;
                    left: -30px;
                    top: -30px;
                }
                
                .radio-waves .wave:nth-child(2) {
                    animation-delay: 1s;
                }
                
                .radio-waves .wave:nth-child(3) {
                    animation-delay: 2s;
                }
                
                .radio-animation.playing .wave {
                    animation-play-state: running;
                }
                
                .radio-animation:not(.playing) .wave {
                    animation-play-state: paused;
                }
                
                @keyframes radioWave {
                    0% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(3);
                        opacity: 0;
                    }
                }
                
                .radio-interface {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize when needed
window.internetRadio = new InternetRadio();