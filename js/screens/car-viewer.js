// 3D Car Viewer for Audi S5 Prestige
class CarViewer {
    constructor() {
        this.init();
    }

    init() {
        this.setupClickableParts();
    }

    setupClickableParts() {
        const clickableZones = document.querySelectorAll('.clickable-zone');
        clickableZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLock(zone);
            });
        });
    }

    toggleLock(zone) {
        const icon = zone.querySelector('i');
        const isLocked = icon.classList.contains('fa-lock');
        
        if (isLocked) {
            icon.classList.remove('fa-lock');
            icon.classList.add('fa-lock-open');
            zone.classList.add('unlocked');
            
            // Show notification
            this.showNotification(`${zone.dataset.part} unlocked`);
        } else {
            icon.classList.remove('fa-lock-open');
            icon.classList.add('fa-lock');
            zone.classList.remove('unlocked');
            
            // Show notification
            this.showNotification(`${zone.dataset.part} locked`);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'car-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.car-image-container')) {
        new CarViewer();
    }
});