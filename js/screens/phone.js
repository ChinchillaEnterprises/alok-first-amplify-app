// Simplified Phone Pairing System
class SimplePhoneManager {
    constructor() {
        this.connected = false;
        this.pairingCode = null;
        this.deviceName = '';
        this.websocket = null;
        this.serverPort = 8080;
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.setupWebSocketServer();
    }
    
    generatePairingCode() {
        // Generate 6-digit pairing code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    updateUI() {
        const phoneContainer = document.querySelector('.phone-container');
        if (!phoneContainer) return;
        
        if (!this.connected) {
            // Show connect button
            phoneContainer.innerHTML = `
                <div class="phone-pairing">
                    <h2>Phone Connection</h2>
                    <button class="connect-device-btn" onclick="window.simplePhoneManager.startPairing()">
                        Connect Device
                    </button>
                </div>
            `;
        } else {
            // Show connected interface
            this.showConnectedInterface();
        }
    }
    
    startPairing() {
        this.pairingCode = this.generatePairingCode();
        const phoneContainer = document.querySelector('.phone-container');
        
        phoneContainer.innerHTML = `
            <div class="phone-pairing active">
                <h2>Phone Pairing</h2>
                <div class="pairing-code-display">
                    <h3>Enter this code on your phone:</h3>
                    <div class="code-digits">
                        ${this.pairingCode.split('').map(digit => 
                            `<span class="code-digit">${digit}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="pairing-instructions">
                    <p>On your phone:</p>
                    <ol>
                        <li>Open browser and go to:</li>
                        <li class="url">http://${this.getLocalIP()}:${this.serverPort}</li>
                        <li>Enter the code above</li>
                    </ol>
                </div>
                
                <button class="cancel-btn" onclick="window.simplePhoneManager.cancelPairing()">
                    Cancel
                </button>
                
                <div class="pairing-status">
                    <i class="fas fa-spinner fa-spin"></i> Waiting for connection...
                </div>
            </div>
        `;
        
        // Start listening for connections
        this.listenForPairing();
    }
    
    getLocalIP() {
        // This would normally get your actual local IP
        // For demo, we'll show localhost
        return 'localhost';
    }
    
    listenForPairing() {
        // In a real implementation, this would listen for WebSocket connections
        // For demo, we'll simulate a connection after 5 seconds
        setTimeout(() => {
            if (this.pairingCode) {
                this.simulatePhoneConnection();
            }
        }, 5000);
    }
    
    simulatePhoneConnection() {
        this.connected = true;
        this.deviceName = 'iPhone';
        this.showConnectionSuccess();
        
        setTimeout(() => {
            this.showConnectedInterface();
        }, 2000);
    }
    
    showConnectionSuccess() {
        const phoneContainer = document.querySelector('.phone-container');
        phoneContainer.innerHTML = `
            <div class="phone-pairing success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Connected!</h2>
                <p>Your phone is now connected</p>
            </div>
        `;
    }
    
    showConnectedInterface() {
        const phoneContainer = document.querySelector('.phone-container');
        phoneContainer.innerHTML = `
            <div class="phone-connected">
                <div class="phone-header">
                    <h2>Phone</h2>
                    <div class="connected-info">
                        <i class="fas fa-mobile-alt"></i>
                        <span>${this.deviceName}</span>
                        <button class="disconnect-btn" onclick="window.simplePhoneManager.showDisconnectConfirm()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="phone-features">
                    <div class="feature-grid">
                        <button class="feature-btn" onclick="window.simplePhoneManager.openDialer()">
                            <i class="fas fa-phone"></i>
                            <span>Dialer</span>
                        </button>
                        <button class="feature-btn" onclick="window.simplePhoneManager.openContacts()">
                            <i class="fas fa-address-book"></i>
                            <span>Contacts</span>
                        </button>
                        <button class="feature-btn" onclick="window.simplePhoneManager.openRecent()">
                            <i class="fas fa-clock"></i>
                            <span>Recent</span>
                        </button>
                        <button class="feature-btn" onclick="window.simplePhoneManager.openMessages()">
                            <i class="fas fa-comment"></i>
                            <span>Messages</span>
                        </button>
                    </div>
                </div>
                
                <div class="phone-content" id="phone-feature-content">
                    <!-- Feature content loads here -->
                </div>
            </div>
        `;
        
        // Load dialer by default
        this.openDialer();
    }
    
    openDialer() {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="simple-dialer">
                <input type="text" id="phone-number" class="phone-input" placeholder="Enter number">
                <div class="dial-pad">
                    ${[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(digit => 
                        `<button class="dial-btn" onclick="window.simplePhoneManager.dial('${digit}')">${digit}</button>`
                    ).join('')}
                </div>
                <div class="dial-actions">
                    <button class="delete-btn" onclick="window.simplePhoneManager.deleteDigit()">
                        <i class="fas fa-backspace"></i>
                    </button>
                    <button class="call-btn" onclick="window.simplePhoneManager.makeCall()">
                        <i class="fas fa-phone"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    openContacts() {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="contacts-simple">
                <div class="contact-item" onclick="window.simplePhoneManager.callNumber('Mom', '555-1234')">
                    <i class="fas fa-user-circle"></i>
                    <div class="contact-info">
                        <div class="name">Mom</div>
                        <div class="number">555-1234</div>
                    </div>
                    <i class="fas fa-phone"></i>
                </div>
                <div class="contact-item" onclick="window.simplePhoneManager.callNumber('John', '555-5678')">
                    <i class="fas fa-user-circle"></i>
                    <div class="contact-info">
                        <div class="name">John</div>
                        <div class="number">555-5678</div>
                    </div>
                    <i class="fas fa-phone"></i>
                </div>
            </div>
        `;
    }
    
    openRecent() {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="recent-simple">
                <div class="call-item">
                    <i class="fas fa-phone-alt incoming"></i>
                    <div class="call-info">
                        <div class="name">Mom</div>
                        <div class="time">10 min ago</div>
                    </div>
                </div>
                <div class="call-item">
                    <i class="fas fa-phone outgoing"></i>
                    <div class="call-info">
                        <div class="name">John</div>
                        <div class="time">1 hour ago</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    openMessages() {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="messages-simple">
                <div class="message-item" onclick="window.simplePhoneManager.openChat('Mom')">
                    <i class="fas fa-user-circle"></i>
                    <div class="message-info">
                        <div class="name">Mom</div>
                        <div class="preview">Hey, are you coming for dinner?</div>
                    </div>
                    <div class="time">5:30 PM</div>
                </div>
                <div class="message-item" onclick="window.simplePhoneManager.openChat('John')">
                    <i class="fas fa-user-circle"></i>
                    <div class="message-info">
                        <div class="name">John</div>
                        <div class="preview">See you at the meeting</div>
                    </div>
                    <div class="time">2:15 PM</div>
                </div>
            </div>
        `;
    }
    
    openChat(name) {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="chat-simple">
                <div class="chat-header">
                    <button onclick="window.simplePhoneManager.openMessages()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <span>${name}</span>
                </div>
                <div class="chat-messages">
                    <div class="message received">Hey, are you coming for dinner?</div>
                    <div class="message sent">Yes, I'll be there at 7!</div>
                </div>
                <div class="chat-input">
                    <input type="text" placeholder="Type a message...">
                    <button><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
    }
    
    dial(digit) {
        const input = document.getElementById('phone-number');
        if (input) input.value += digit;
    }
    
    deleteDigit() {
        const input = document.getElementById('phone-number');
        if (input) input.value = input.value.slice(0, -1);
    }
    
    makeCall() {
        const number = document.getElementById('phone-number').value;
        if (number) {
            this.showCallingScreen(number, 'Unknown');
        }
    }
    
    callNumber(name, number) {
        this.showCallingScreen(number, name);
    }
    
    showCallingScreen(number, name) {
        const content = document.getElementById('phone-feature-content');
        content.innerHTML = `
            <div class="calling-simple">
                <div class="call-info">
                    <div class="calling-status">Calling...</div>
                    <div class="calling-name">${name}</div>
                    <div class="calling-number">${number}</div>
                </div>
                <div class="call-actions">
                    <button class="end-call-btn" onclick="window.simplePhoneManager.endCall()">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    endCall() {
        this.openDialer();
    }
    
    showDisconnectConfirm() {
        const phoneContainer = document.querySelector('.phone-container');
        phoneContainer.innerHTML = `
            <div class="disconnect-confirm">
                <h2>Driver Change</h2>
                <div class="disconnect-icon">
                    <i class="fas fa-user-friends fa-3x"></i>
                </div>
                <p class="disconnect-message">
                    Disconnect ${this.deviceName} to allow another driver to connect their phone?
                </p>
                <div class="driver-info">
                    <div class="info-item">
                        <i class="fas fa-info-circle"></i>
                        <span>All call history and messages will be cleared</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Your personal data remains private</span>
                    </div>
                </div>
                <div class="disconnect-actions">
                    <button class="confirm-disconnect-btn" onclick="window.simplePhoneManager.confirmDisconnect()">
                        <i class="fas fa-user-slash"></i> Disconnect & Switch Driver
                    </button>
                    <button class="cancel-disconnect-btn" onclick="window.simplePhoneManager.showConnectedInterface()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }
    
    confirmDisconnect() {
        // Show disconnecting animation
        const phoneContainer = document.querySelector('.phone-container');
        phoneContainer.innerHTML = `
            <div class="disconnecting">
                <div class="disconnect-animation">
                    <i class="fas fa-unlink fa-3x"></i>
                </div>
                <h3>Disconnecting ${this.deviceName}...</h3>
                <p>Clearing personal data...</p>
            </div>
        `;
        
        // Clear all personal data
        this.clearPersonalData();
        
        // Show success and reset after animation
        setTimeout(() => {
            phoneContainer.innerHTML = `
                <div class="disconnect-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Phone Disconnected</h3>
                    <p>Ready for new driver</p>
                </div>
            `;
            
            setTimeout(() => {
                this.disconnect();
            }, 1500);
        }, 2000);
    }
    
    clearPersonalData() {
        // Clear any stored personal data
        // In real implementation, this would clear:
        // - Call history
        // - Messages
        // - Contacts cache
        // - Any temporary files
        console.log('Personal data cleared');
        
        // If using WebSocket, notify phone
        if (this.websocket) {
            this.websocket.send(JSON.stringify({
                type: 'disconnected',
                reason: 'driver-change'
            }));
        }
    }
    
    disconnect() {
        this.connected = false;
        this.deviceName = '';
        this.pairingCode = null;
        this.updateUI();
    }
    
    cancelPairing() {
        this.pairingCode = null;
        this.updateUI();
    }
    
    setupWebSocketServer() {
        // This would set up actual WebSocket server
        // For now, just console log
        console.log('WebSocket server would run on port', this.serverPort);
    }
    
    addStyles() {
        if (!document.getElementById('simple-phone-styles')) {
            const style = document.createElement('style');
            style.id = 'simple-phone-styles';
            style.textContent = `
                .phone-pairing {
                    text-align: center;
                    padding: 50px;
                }
                
                .connect-device-btn {
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 20px 40px;
                    font-size: 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .connect-device-btn:hover {
                    background: #cc0000;
                    transform: scale(1.05);
                }
                
                .pairing-code-display {
                    margin: 30px 0;
                }
                
                .code-digits {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                }
                
                .code-digit {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    font-size: 36px;
                    font-weight: bold;
                    border-radius: 10px;
                    min-width: 50px;
                }
                
                .pairing-instructions {
                    background: rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px auto;
                    max-width: 400px;
                    text-align: left;
                }
                
                .pairing-instructions .url {
                    background: rgba(255,255,255,0.1);
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    margin: 10px 0;
                }
                
                .cancel-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    padding: 10px 30px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                
                .pairing-status {
                    margin-top: 30px;
                    opacity: 0.7;
                }
                
                .success-icon {
                    font-size: 64px;
                    color: #00ff00;
                    margin-bottom: 20px;
                }
                
                .phone-connected {
                    padding: 20px;
                }
                
                .phone-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                
                .connected-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.1);
                    padding: 10px 20px;
                    border-radius: 20px;
                }
                
                .disconnect-btn {
                    background: none;
                    border: none;
                    color: #ff0000;
                    cursor: pointer;
                    padding: 5px;
                }
                
                .feature-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    margin-bottom: 30px;
                }
                
                .feature-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                
                .feature-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: translateY(-2px);
                }
                
                .feature-btn i {
                    font-size: 24px;
                }
                
                .simple-dialer {
                    max-width: 300px;
                    margin: 0 auto;
                }
                
                .phone-input {
                    width: 100%;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    padding: 15px;
                    font-size: 24px;
                    text-align: center;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                
                .dial-pad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .dial-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    padding: 20px;
                    font-size: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .dial-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .dial-actions {
                    display: flex;
                    gap: 20px;
                }
                
                .delete-btn, .call-btn {
                    flex: 1;
                    padding: 15px;
                    border: none;
                    border-radius: 30px;
                    font-size: 20px;
                    cursor: pointer;
                }
                
                .delete-btn {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }
                
                .call-btn {
                    background: #00ff00;
                    color: black;
                }
                
                .contact-item, .call-item, .message-item {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background: rgba(255,255,255,0.05);
                    margin-bottom: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                }
                
                .contact-item:hover, .message-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .contact-info, .call-info, .message-info {
                    flex: 1;
                    margin-left: 15px;
                }
                
                .name {
                    font-weight: 500;
                }
                
                .number, .time, .preview {
                    font-size: 14px;
                    opacity: 0.7;
                }
                
                .incoming {
                    color: #00ff00;
                }
                
                .outgoing {
                    color: #4488ff;
                }
                
                .calling-simple {
                    text-align: center;
                    padding: 50px;
                }
                
                .calling-status {
                    font-size: 18px;
                    opacity: 0.7;
                    margin-bottom: 10px;
                }
                
                .calling-name {
                    font-size: 32px;
                    margin-bottom: 5px;
                }
                
                .calling-number {
                    font-size: 20px;
                    opacity: 0.7;
                    margin-bottom: 50px;
                }
                
                .end-call-btn {
                    background: #ff0000;
                    border: none;
                    color: white;
                    padding: 20px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    width: 80px;
                    height: 80px;
                }
                
                .chat-simple {
                    display: flex;
                    flex-direction: column;
                    height: 400px;
                }
                
                .chat-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px 10px 0 0;
                }
                
                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .message {
                    max-width: 70%;
                    padding: 10px 15px;
                    border-radius: 15px;
                    margin-bottom: 10px;
                }
                
                .message.sent {
                    background: #0066cc;
                    margin-left: auto;
                }
                
                .message.received {
                    background: rgba(255,255,255,0.1);
                }
                
                .chat-input {
                    display: flex;
                    gap: 10px;
                    padding: 15px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 0 0 10px 10px;
                }
                
                .chat-input input {
                    flex: 1;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    padding: 10px;
                    color: white;
                    border-radius: 20px;
                }
                
                .chat-input button {
                    background: #0066cc;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                }
                
                /* Disconnect styles */
                .disconnect-confirm {
                    text-align: center;
                    padding: 50px 20px;
                }
                
                .disconnect-icon {
                    margin: 30px 0;
                    color: #ff9900;
                }
                
                .disconnect-message {
                    font-size: 18px;
                    margin-bottom: 30px;
                    line-height: 1.5;
                }
                
                .driver-info {
                    background: rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    text-align: left;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    opacity: 0.8;
                }
                
                .info-item:last-child {
                    margin-bottom: 0;
                }
                
                .info-item i {
                    color: #4488ff;
                }
                
                .disconnect-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 400px;
                    margin: 0 auto;
                }
                
                .confirm-disconnect-btn {
                    background: #ff0000;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .confirm-disconnect-btn:hover {
                    background: #cc0000;
                }
                
                .cancel-disconnect-btn {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .cancel-disconnect-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .disconnecting {
                    text-align: center;
                    padding: 100px 20px;
                }
                
                .disconnect-animation {
                    margin-bottom: 30px;
                    animation: rotate 2s linear infinite;
                }
                
                .disconnect-animation i {
                    color: #ff9900;
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .disconnecting h3 {
                    margin-bottom: 10px;
                }
                
                .disconnecting p {
                    opacity: 0.7;
                }
                
                .disconnect-success {
                    text-align: center;
                    padding: 100px 20px;
                }
                
                .disconnect-success .success-icon {
                    font-size: 64px;
                    color: #00ff00;
                    margin-bottom: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simplePhoneManager = new SimplePhoneManager();
    window.simplePhoneManager.addStyles();
});

// Also initialize when switching to phone screen
document.addEventListener('click', (e) => {
    if (e.target.matches('.nav-btn[data-screen="phone"]') || e.target.closest('.nav-btn[data-screen="phone"]')) {
        setTimeout(() => {
            if (!window.simplePhoneManager) {
                window.simplePhoneManager = new SimplePhoneManager();
                window.simplePhoneManager.addStyles();
            }
            window.simplePhoneManager.updateUI();
        }, 100);
    }
});