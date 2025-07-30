class GamingProfile {
    constructor() {
        this.userId = '726790429055385620';
        this.apiUrl = 'https://api.lanyard.rest/v1/users/';
        this.isPlaying = false;
        this.init();
    }

    init() {
        this.setupCursor();
        this.setupMusicControl();
        this.loadProfile();
        this.startStatusUpdates();
        this.addScrollEffects();
    }

    // Custom Cursor
    setupCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            
            setTimeout(() => {
                follower.style.left = e.clientX - 20 + 'px';
                follower.style.top = e.clientY - 20 + 'px';
            }, 100);
        });

        // Cursor hover effects
        const hoverElements = document.querySelectorAll('button, a, .stat-card, .setup-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                follower.style.transform = 'scale(1.2)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
            });
        });
    }

    // Music Control
    setupMusicControl() {
        const musicBtn = document.getElementById('musicToggle');
        const audio = document.getElementById('backgroundMusic');
        
        // Create a simple audio context for background music
        this.createBackgroundMusic();
        
        musicBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stopMusic();
                musicBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                this.playMusic();
                musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
            this.isPlaying = !this.isPlaying;
        });
    }

    createBackgroundMusic() {
        // Create a simple ambient gaming sound using Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.oscillator = null;
            this.gainNode = null;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playMusic() {
        if (!this.audioContext) return;
        
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        // Create ambient gaming atmosphere
        this.oscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low bass
        this.oscillator.type = 'sine';
        this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        this.oscillator.start();
        
        // Add some variation
        this.musicInterval = setInterval(() => {
            if (this.oscillator) {
                const freq = 55 + Math.random() * 20;
                this.oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            }
        }, 2000);
    }

    stopMusic() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
        }
    }

    // Load Discord Profile
    async loadProfile() {
        try {
            const response = await fetch(`${this.apiUrl}${this.userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateProfile(data.data);
                this.updateActivities(data.data.activities);
                this.updateSpotify(data.data.spotify, data.data.listening_to_spotify);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            this.showError();
        }
    }

    updateProfile(userData) {
        const avatar = document.getElementById('userAvatar');
        const username = document.getElementById('username');
        const statusBadge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusRing = document.getElementById('statusRing');

        // Update avatar
        if (userData.discord_user.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=256`;
            avatar.src = avatarUrl;
        }

        // Update username
        username.textContent = userData.discord_user.global_name || userData.discord_user.username;

        // Update status
        const status = userData.discord_status;
        const statusMessages = {
            'online': '🔥 Ready to Dominate!',
            'idle': '⏰ Taking a Break',
            'dnd': '🎮 In Game Mode',
            'offline': '💤 Offline'
        };

        statusText.textContent = statusMessages[status] || 'Unknown Status';
        statusIndicator.className = `status-indicator status-${status}`;
        statusRing.style.borderColor = this.getStatusColor(status);
    }

    updateActivities(activities) {
        const container = document.getElementById('activityContainer');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="activity-card">
                    <div class="activity-icon">🎮</div>
                    <div class="activity-info">
                        <h3>No Current Activity</h3>
                        <p>Ready for the next gaming session!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => {
            const activityIcons = {
                0: '🎮', // Playing
                1: '📺', // Streaming  
                2: '🎵', // Listening
                3: '👀', // Watching
                5: '🏆'  // Competing
            };

            const icon = activityIcons[activity.type] || '🎮';
            const timeStr = activity.timestamps?.start ? 
                this.formatTime(Date.now() - activity.timestamps.start) : '';

            return `
                <div class="activity-card">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-info">
                        <h3>${activity.name}</h3>
                        ${activity.details ? `<p>${activity.details}</p>` : ''}
                        ${activity.state ? `<p>${activity.state}</p>` : ''}
                        ${timeStr ? `<div class="activity-time">Playing for ${timeStr}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSpotify(spotify, isListening) {
        const section = document.getElementById('spotifySection');
        const container = document.getElementById('spotifyContainer');

        if (!isListening || !spotify) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = `
            <div class="spotify-card">
                <img src="${spotify.album_art_url}" alt="Album Art" class="album-art">
                <div class="track-info">
                    <h3>${spotify.song}</h3>
                    <div class="artist">by ${spotify.artist}</div>
                    <div class="album">on ${spotify.album}</div>
                </div>
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'online': '#00FF00',
            'idle': '#FFA500', 
            'dnd': '#FF0000',
            'offline': '#808080'
        };
        return colors[status] || '#808080';
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    }

    startStatusUpdates() {
        // Update every 30 seconds
        setInterval(() => {
            this.loadProfile();
        }, 30000);
    }

    addScrollEffects() {
        // Add parallax and scroll animations
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.background-animation');
            const speed = scrolled * 0.5;
            
            if (parallax) {
                parallax.style.transform = `translateY(${speed}px)`;
            }

            // Animate cards on scroll
            const cards = document.querySelectorAll('.stat-card, .setup-card, .activity-card');
            cards.forEach(card => {
                const cardTop = card.offsetTop;
                const cardHeight = card.offsetHeight;
                const windowHeight = window.innerHeight;
                
                if (scrolled + windowHeight > cardTop + cardHeight / 4) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        });

        // Initialize cards as hidden
        const cards = document.querySelectorAll('.stat-card, .setup-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 0.6s ease';
        });
    }

    showError() {
        const container = document.getElementById('activityContainer');
        container.innerHTML = `
            <div class="activity-card">
                <div class="activity-icon">⚠️</div>
                <div class="activity-info">
                    <h3>Connection Error</h3>
                    <p>Unable to load Discord status. Check your connection!</p>
                </div>
            </div>
        `;
    }
}

// Initialize the gaming profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamingProfile();
    
    // Add some extra gaming effects
    addGamingEffects();
});

function addGamingEffects() {
    // Random glitch effect on username
    const username = document.querySelector('.username');
    if (username) {
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                username.style.animation = 'glitch 0.3s ease-in-out';
                setTimeout(() => {
                    username.style.animation = '';
                }, 300);
            }
        }, 5000);
    }

    // Particle system enhancement
    createFloatingParticles();
}

function createFloatingParticles() {
    const container = document.querySelector('.background-animation');
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 6000);
    }, 2000);
}

// Add keyboard shortcuts for gaming feel
document.addEventListener('keydown', (e) => {
    // Easter eggs for gaming keys
    if (e.code === 'KeyW' && e.ctrlKey) {
        e.preventDefault();
        document.querySelector('.username').style.color = '#00FF00';
        setTimeout(() => {
            document.querySelector('.username').style.color = '';
        }, 1000);
    }
    
    if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        const musicBtn = document.getElementById('musicToggle');
        musicBtn.click();
    }
});