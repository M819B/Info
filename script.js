class GamingProfile {
    constructor() {
        this.userId = '726790429055385620';
        this.apiUrl = `https://api.lanyard.rest/v1/users/${this.userId}`;
        this.backgroundMusic = document.getElementById('background-music');
        this.musicToggle = document.getElementById('music-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
        
        this.init();
    }

    init() {
        this.setupCursor();
        this.setupParticles();
        this.setupMusicControls();
        this.fetchDiscordStatus();
        this.startAutoRefresh();
    }

    // Ultra Fast Custom Cursor
    setupCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Ultra fast cursor movement
            cursor.style.left = mouseX - 10 + 'px';
            cursor.style.top = mouseY - 10 + 'px';
        });

        // Smooth follower animation
        const animateFollower = () => {
            const speed = 0.15;
            followerX += (mouseX - followerX) * speed;
            followerY += (mouseY - followerY) * speed;
            
            follower.style.left = followerX - 20 + 'px';
            follower.style.top = followerY - 20 + 'px';
            
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        // Cursor hover effects
        const interactiveElements = document.querySelectorAll('a, button, .social-link');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                follower.style.transform = 'scale(1.3)';
                follower.style.borderColor = '#FF3333';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
                follower.style.borderColor = '#FF0000';
            });
        });
    }

    // Particle System
    setupParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Music Controls
    setupMusicControls() {
        this.backgroundMusic.volume = 0.3;

        this.musicToggle.addEventListener('click', () => {
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play();
                this.musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                this.backgroundMusic.pause();
                this.musicToggle.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.backgroundMusic.volume = e.target.value / 100;
        });
    }

    // Discord Status Fetching
    async fetchDiscordStatus() {
        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();
            
            if (data.success) {
                this.updateProfile(data.data);
            } else {
                this.showError('Failed to fetch Discord status');
            }
        } catch (error) {
            console.error('Error fetching Discord status:', error);
            this.showError('Unable to connect to Discord API');
        }
    }

    updateProfile(userData) {
        // Update avatar
        const avatar = document.getElementById('avatar');
        const avatarUrl = userData.discord_user.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png?size=256`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
        avatar.src = avatarUrl;

        // Update username
        const username = document.getElementById('username');
        username.textContent = userData.discord_user.global_name || userData.discord_user.username;

        // Update status
        this.updateStatus(userData.discord_status);
        
        // Update activities
        this.updateActivities(userData.activities);
        
        // Update Spotify
        if (userData.listening_to_spotify && userData.spotify) {
            this.updateSpotify(userData.spotify);
        }
    }

    updateStatus(status) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const statusBadge = document.getElementById('status-badge');

        const statusConfig = {
            online: { color: '#00FF00', text: 'Online', display: 'Online' },
            idle: { color: '#FFA500', text: 'Away', display: 'Away' },
            dnd: { color: '#FF0000', text: 'Do Not Disturb', display: 'Do Not Disturb' },
            offline: { color: '#808080', text: 'Offline', display: 'Offline' }
        };

        const config = statusConfig[status] || statusConfig.offline;
        
        statusIndicator.style.backgroundColor = config.color;
        statusText.textContent = `Status: ${config.text}`;
        statusBadge.textContent = config.display;
        statusBadge.className = `status-badge ${status}`;
    }

    updateActivities(activities) {
        const activitiesSection = document.getElementById('activities-section');
        const activitiesContainer = document.getElementById('activities-container');

        if (!activities || activities.length === 0) {
            activitiesSection.style.display = 'none';
            return;
        }

        activitiesSection.style.display = 'block';
        activitiesContainer.innerHTML = '';

        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            const activityType = this.getActivityType(activity.type);
            const startTime = activity.timestamps?.start 
                ? this.formatTimestamp(activity.timestamps.start)
                : '';

            activityElement.innerHTML = `
                <div class="activity-header">
                    <h3>${activity.name}</h3>
                    <span class="activity-type">${activityType}</span>
                </div>
                ${activity.details ? `<p class="activity-details">${activity.details}</p>` : ''}
                ${activity.state ? `<p class="activity-state">${activity.state}</p>` : ''}
                ${startTime ? `<p class="activity-time">Started ${startTime}</p>` : ''}
            `;

            activitiesContainer.appendChild(activityElement);
        });
    }

    updateSpotify(spotify) {
        const spotifySection = document.getElementById('spotify-section');
        const spotifyContent = document.getElementById('spotify-content');

        spotifySection.style.display = 'block';
        
        spotifyContent.innerHTML = `
            <div class="spotify-track">
                <img src="${spotify.album_art_url}" alt="Album Art">
                <div class="track-info">
                    <h3>${spotify.song}</h3>
                    <p>by ${spotify.artist}</p>
                    <p>on ${spotify.album}</p>
                </div>
            </div>
        `;
    }

    getActivityType(type) {
        const types = {
            0: 'Playing',
            1: 'Streaming',
            2: 'Listening to',
            3: 'Watching',
            5: 'Competing in'
        };
        return types[type] || 'Activity';
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ago`;
        } else {
            return `${minutes}m ago`;
        }
    }

    showError(message) {
        const statusText = document.getElementById('status-text');
        statusText.textContent = message;
        statusText.style.color = '#FF0000';
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.fetchDiscordStatus();
        }, 30000);
    }
}

// Initialize the gaming profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamingProfile();
});

// Add some extra gaming effects
document.addEventListener('keydown', (e) => {
    // Easter egg: Press 'G' for glitch effect
    if (e.key.toLowerCase() === 'g') {
        document.body.style.animation = 'glitch 0.3s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 300);
    }
});
