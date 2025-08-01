// Local Music Player - No authentication needed
class LocalMusicPlayer {
    constructor() {
        this.audioElement = new Audio();
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        
        // Demo tracks (you can add your own)
        this.tracks = [
            {
                title: "Driving Music Mix",
                artist: "Audi Infotainment",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            },
            {
                title: "Highway Cruise",
                artist: "Audi Infotainment",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
            },
            {
                title: "Night Drive",
                artist: "Audi Infotainment",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
            }
        ];
        
        this.init();
    }
    
    init() {
        // Set up audio element
        this.audioElement.addEventListener('ended', () => this.next());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
    }
    
    loadTrack(index) {
        const track = this.tracks[index];
        if (track) {
            this.audioElement.src = track.url;
            this.updateDisplay(track);
        }
    }
    
    updateDisplay(track) {
        const nowPlaying = document.querySelector('.now-playing');
        if (nowPlaying) {
            nowPlaying.innerHTML = `
                <div class="album-art" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg, #ff0000, #000);">
                    <i class="fas fa-music fa-3x"></i>
                </div>
                <div class="track-info">
                    <h2>${track.title}</h2>
                    <p>${track.artist}</p>
                </div>
            `;
        }
    }
    
    play() {
        if (!this.audioElement.src) {
            this.loadTrack(0);
        }
        this.audioElement.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }
    
    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }
    
    togglePlayback() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    next() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    previous() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    setVolume(value) {
        this.audioElement.volume = value / 100;
    }
    
    updateProgress() {
        const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        const progressBar = document.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
    
    updatePlayButton() {
        const playBtn = document.querySelector('.main-btn i');
        if (playBtn) {
            playBtn.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
}

// Add to media player
if (window.mediaPlayer) {
    window.mediaPlayer.localMusic = new LocalMusicPlayer();
}