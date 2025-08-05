// Bluetooth Server for Audi Infotainment
// This sets up your computer as a Bluetooth device that phones can discover

const { ipcRenderer } = require('electron');

class BluetoothServer {
    constructor() {
        this.deviceName = 'Audi S5 Infotainment';
        this.isAdvertising = false;
        this.connectedDevice = null;
        
        this.init();
    }
    
    init() {
        // Request Bluetooth permissions
        this.requestBluetoothAccess();
        
        // Listen for connection events from main process
        if (ipcRenderer) {
            ipcRenderer.on('bluetooth-device-connected', (event, device) => {
                this.handleDeviceConnected(device);
            });
            
            ipcRenderer.on('bluetooth-device-disconnected', (event, device) => {
                this.handleDeviceDisconnected(device);
            });
        }
    }
    
    async requestBluetoothAccess() {
        try {
            // For macOS, we need to request Bluetooth permissions
            if (process.platform === 'darwin') {
                console.log('Requesting Bluetooth access for macOS...');
            }
            
            // Start advertising as a Bluetooth device
            this.startAdvertising();
        } catch (error) {
            console.error('Bluetooth access error:', error);
        }
    }
    
    startAdvertising() {
        // In main process, we would use node-bluetooth or noble
        // For now, we'll use Web Bluetooth API in renderer
        
        if ('bluetooth' in navigator) {
            console.log('Web Bluetooth API available');
            this.setupWebBluetooth();
        } else {
            console.log('Web Bluetooth not available, using IPC method');
            this.setupIPCBluetooth();
        }
    }
    
    setupWebBluetooth() {
        // Note: Web Bluetooth API is primarily for connecting TO devices,
        // not for making your computer discoverable AS a device
        console.log('Web Bluetooth setup - limited to client mode');
    }
    
    setupIPCBluetooth() {
        // Send message to main process to start Bluetooth server
        if (ipcRenderer) {
            ipcRenderer.send('start-bluetooth-server', {
                deviceName: this.deviceName,
                services: ['hands-free', 'audio-sink', 'phone-book-access']
            });
        }
    }
    
    handleDeviceConnected(device) {
        console.log('Device connected:', device);
        this.connectedDevice = device;
        
        // Update UI
        if (window.phoneManager) {
            window.phoneManager.deviceName = device.name || 'Phone';
            window.phoneManager.connected = true;
            window.phoneManager.showPhoneInterface();
        }
        
        // Show notification
        this.showNotification(`${device.name} connected`);
    }
    
    handleDeviceDisconnected(device) {
        console.log('Device disconnected:', device);
        this.connectedDevice = null;
        
        // Update UI
        if (window.phoneManager) {
            window.phoneManager.connected = false;
            window.phoneManager.updateConnectionUI();
        }
        
        // Show notification
        this.showNotification(`${device.name} disconnected`);
    }
    
    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.9);
            color: black;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Method to make the system discoverable
    makeDiscoverable() {
        console.log(`Making system discoverable as "${this.deviceName}"`);
        
        // This would typically be handled in the main process
        if (ipcRenderer) {
            ipcRenderer.send('make-discoverable', {
                timeout: 300 // 5 minutes
            });
        }
    }
}

// Initialize Bluetooth server
if (typeof window !== 'undefined') {
    window.bluetoothServer = new BluetoothServer();
}

// Export for main process if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BluetoothServer;
}