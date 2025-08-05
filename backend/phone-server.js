// WebSocket server for phone communication
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 8080;
let connectedPhones = new Map();
let pairingCodes = new Map();

// Serve the phone web app
app.use(express.static(path.join(__dirname, '../phone-app')));
app.use(express.json());

// Pairing endpoint
app.post('/pair', (req, res) => {
    const { code } = req.body;
    
    if (pairingCodes.has(code)) {
        const sessionId = generateSessionId();
        connectedPhones.set(sessionId, {
            paired: true,
            code: code,
            connectedAt: new Date()
        });
        
        // Notify Electron app of successful pairing
        broadcastToElectron({
            type: 'phone-paired',
            sessionId: sessionId
        });
        
        res.json({ success: true, sessionId: sessionId });
    } else {
        res.json({ success: false, error: 'Invalid pairing code' });
    }
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (error) {
            console.error('Invalid message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

function handleMessage(ws, data) {
    switch (data.type) {
        case 'register-electron':
            ws.isElectron = true;
            ws.send(JSON.stringify({ type: 'registered' }));
            break;
            
        case 'generate-pairing-code':
            const code = generatePairingCode();
            pairingCodes.set(code, true);
            ws.send(JSON.stringify({ type: 'pairing-code', code: code }));
            
            // Remove code after 5 minutes
            setTimeout(() => {
                pairingCodes.delete(code);
            }, 5 * 60 * 1000);
            break;
            
        case 'phone-data':
            // Forward phone data to Electron app
            broadcastToElectron({
                type: 'phone-data',
                data: data.payload
            });
            break;
            
        case 'make-call':
            // Forward call request to Electron for display
            broadcastToElectron({
                type: 'call-request',
                number: data.number,
                name: data.name
            });
            break;
            
        case 'send-message':
            // Forward message to Electron
            broadcastToElectron({
                type: 'message',
                to: data.to,
                text: data.text
            });
            break;
    }
}

function broadcastToElectron(data) {
    wss.clients.forEach((client) => {
        if (client.isElectron && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function generatePairingCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionId() {
    return Math.random().toString(36).substring(7);
}

server.listen(PORT, () => {
    console.log(`Phone server running on port ${PORT}`);
});