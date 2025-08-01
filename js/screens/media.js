// Media Player - Simplified Version
class MediaPlayer {
    constructor() {
        this.currentSource = 'radio';
        this.isPlaying = false;
        this.currentTrack = null;
        this.radioStations = [
            { name: 'FM 101.5', frequency: '101.5' },
            { name: 'FM 103.7', frequency: '103.7' },
            { name: 'FM 106.1', frequency: '106.1' },
            { name: 'FM 94.9', frequency: '94.9' },
            { name: 'FM 96.5', frequency: '96.5' }
        ];
        this.currentStation = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSourceDisplay();
    }

    setupEventListeners() {
        // Source buttons
        const sourceBtns = document.querySelectorAll('.source-btn');
        sourceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const source = e.target.textContent.toLowerCase();
                this.switchSource(source);
            });
        });

        // Playback controls
        const playBtn = document.querySelector('.main-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlayback());
        }

        const prevBtn = document.querySelector('.media-btn:nth-child(2)');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previous());
        }

        const nextBtn = document.querySelector('.media-btn:nth-child(4)');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }

        // Volume control
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }
    }

    async switchSource(source) {
        this.currentSource = source;
        
        // Update UI
        document.querySelectorAll('.source-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === source) {
                btn.classList.add('active');
            }
        });

        // Handle source switching
        switch(source) {
            case 'spotify':
                this.showSpotifyLogin();
                break;
            case 'radio':
                this.showRadioInterface();
                break;
            case 'bluetooth':
                this.showBluetoothInterface();
                break;
            case 'usb':
                this.showUSBInterface();
                break;
        }
    }

    showSpotifyLogin() {
        // Directly show the Spotify embed
        this.useSpotifyEmbed();
    }
    
    useSpotifyEmbed() {
        const nowPlaying = document.querySelector('.now-playing');
        nowPlaying.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                    <button onclick="mediaPlayer.loadSpotifyEmbed('37i9dQZF1DXcBWIGoYBM5M')" 
                            style="background: #1DB954; border: none; color: white; padding: 8px 16px; 
                            border-radius: 20px; cursor: pointer;">Today's Hits</button>
                    <button onclick="mediaPlayer.loadSpotifyEmbed('37i9dQZF1DX0XUsuxWHRQd')" 
                            style="background: #1DB954; border: none; color: white; padding: 8px 16px; 
                            border-radius: 20px; cursor: pointer;">RapCaviar</button>
                    <button onclick="mediaPlayer.loadSpotifyEmbed('37i9dQZF1DXcF6B6QPhFDv')" 
                            style="background: #1DB954; border: none; color: white; padding: 8px 16px; 
                            border-radius: 20px; cursor: pointer;">Rock This</button>
                    <button onclick="mediaPlayer.loadCustomPlaylist()" 
                            style="background: #666; border: none; color: white; padding: 8px 16px; 
                            border-radius: 20px; cursor: pointer;">Custom Playlist</button>
                    <button onclick="mediaPlayer.openSpotifyConnect()" 
                            style="background: #ff0000; border: none; color: white; padding: 8px 16px; 
                            border-radius: 20px; cursor: pointer;">
                            <i class="fas fa-external-link-alt"></i> Open Spotify & Play Here
                    </button>
                </div>
                <iframe id="spotify-embed"
                        src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M" 
                        width="100%" 
                        height="100%" 
                        frameborder="0" 
                        allowtransparency="true" 
                        allow="encrypted-media"
                        style="border-radius: 10px; flex: 1;">
                </iframe>
            </div>
        `;
    }
    
    loadSpotifyEmbed(playlistId) {
        const iframe = document.getElementById('spotify-embed');
        if (iframe) {
            iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}`;
        }
    }
    
    loadCustomPlaylist() {
        const playlistUrl = prompt('Enter Spotify playlist URL or ID:');
        if (playlistUrl) {
            let playlistId = playlistUrl;
            // Extract ID if full URL provided
            if (playlistUrl.includes('spotify.com')) {
                const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
                if (match) playlistId = match[1];
            }
            this.loadSpotifyEmbed(playlistId);
        }
    }
    
    openSpotifyConnect() {
        // Open Spotify web player in browser
        window.open('https://open.spotify.com', '_blank');
        
        // Show instructions
        alert('1. Play music in the opened Spotify tab\n2. At the bottom, click the devices icon\n3. Select "Audi Infotainment" or your computer\n4. Music will play through this app!');
    }


    showRadioInterface() {
        const nowPlaying = document.querySelector('.now-playing');
        const station = this.radioStations[this.currentStation];
        
        nowPlaying.innerHTML = `
            <div class="album-art" style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <i class="fas fa-radio fa-4x" style="margin-bottom: 20px;"></i>
                <h3>${station.name}</h3>
            </div>
            <div class="track-info">
                <h2>${station.name}</h2>
                <p>Local Radio Station</p>
            </div>
        `;
    }

    showBluetoothInterface() {
        const nowPlaying = document.querySelector('.now-playing');
        nowPlaying.innerHTML = `
            <div class="bluetooth-simple">
                <div class="album-art" style="display: flex; align-items: center; justify-content: center;">
                    <i class="fab fa-bluetooth-b fa-4x"></i>
                </div>
                <div class="track-info">
                    <h2>Bluetooth Audio</h2>
                    <p>Connect your phone via System Preferences → Bluetooth</p>
                    <p style="margin-top: 10px; font-size: 14px; opacity: 0.5;">
                        Once connected, audio from your phone will play here
                    </p>
                </div>
            </div>
        `;
    }

    showUSBInterface() {
        // Use the local music player for USB
        if (window.mediaPlayer.localMusic) {
            window.mediaPlayer.localMusic.loadTrack(0);
            window.mediaPlayer.localMusic.updateDisplay(window.mediaPlayer.localMusic.tracks[0]);
        } else {
            const nowPlaying = document.querySelector('.now-playing');
            nowPlaying.innerHTML = `
                <div class="album-art" style="display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-usb fa-4x"></i>
                </div>
                <div class="track-info">
                    <h2>USB Media</h2>
                    <p>Loading music...</p>
                </div>
            `;
        }
    }

    async togglePlayback() {
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
        
        // For USB/Local music
        if (this.currentSource === 'usb' && window.mediaPlayer.localMusic) {
            window.mediaPlayer.localMusic.togglePlayback();
        }
    }

    updatePlayButton() {
        const playBtn = document.querySelector('.main-btn i');
        if (playBtn) {
            playBtn.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    async previous() {
        if (this.currentSource === 'radio') {
            this.currentStation = (this.currentStation - 1 + this.radioStations.length) % this.radioStations.length;
            this.showRadioInterface();
        } else if (this.currentSource === 'usb' && window.mediaPlayer.localMusic) {
            window.mediaPlayer.localMusic.previous();
        }
    }

    async next() {
        if (this.currentSource === 'radio') {
            this.currentStation = (this.currentStation + 1) % this.radioStations.length;
            this.showRadioInterface();
        } else if (this.currentSource === 'usb' && window.mediaPlayer.localMusic) {
            window.mediaPlayer.localMusic.next();
        }
    }

    async setVolume(value) {
        console.log('Volume:', value);
        if (this.currentSource === 'usb' && window.mediaPlayer.localMusic) {
            window.mediaPlayer.localMusic.setVolume(value);
        }
    }

    updateProgress(duration, position) {
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            const percentage = (position / duration) * 100;
            progressBar.style.width = percentage + '%';
        }
    }

    updateSourceDisplay() {
        // Make sure the correct source button is highlighted
        const activeSource = document.querySelector(`.source-btn.active`);
        if (activeSource) {
            this.switchSource(activeSource.textContent.toLowerCase());
        }
    }
}

// Initialize media player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mediaPlayer = new MediaPlayer();
});