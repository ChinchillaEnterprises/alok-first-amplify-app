# Claude API Integration Instructions

## Overview
The Audi AI voice assistant is now integrated into your infotainment system. It currently uses browser-based speech recognition and synthesis. To enhance it with Claude AI, follow these instructions.

## Current Features
- Voice recording with visual feedback
- Speech-to-text recognition
- Command processing for:
  - "What's my tire pressure?" - Opens tire pressure overlay
  - "Show fuel level" - Opens fuel overlay
  - "Check oil life" - Opens oil overlay
  - "Show odometer" - Opens odometer overlay
  - "Set temperature to X degrees" - Sets climate temperature
  - "Play music" - Opens media player and starts playback
  - "Navigate to gas station" - Opens navigation and searches for gas stations
  - "Go home" - Returns to home screen
- Text-to-speech responses

## Backend Integration Steps

### 1. Set up a backend server (Node.js example)
```javascript
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: 'YOUR_CLAUDE_API_KEY',
});

app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { command } = req.body;
    
    // Create a context-aware prompt
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an Audi AI assistant. The user said: "${command}". 
                  Respond as a helpful car assistant. Keep responses concise.
                  Available commands: check tire pressure, fuel level, oil life, 
                  navigate, play music, set climate. 
                  Return JSON with: { action: 'command_name', response: 'text' }`
      }]
    });
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### 2. Update audi-ai.js to use the API
Add this to the `processCommand` method:
```javascript
async processCommand(command) {
    try {
        const response = await fetch('http://localhost:3000/api/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        
        const data = await response.json();
        
        // Process Claude's response
        this.speak(data.response);
        
        // Execute the suggested action
        if (data.action) {
            this.executeAction(data.action);
        }
    } catch (error) {
        // Fallback to local command processing
        this.processCommandLocally(command);
    }
}
```

### 3. Environment Variables
Create a `.env` file:
```
CLAUDE_API_KEY=your_api_key_here
PORT=3000
```

### 4. Security Considerations
- Never expose your API key in frontend code
- Implement rate limiting on the backend
- Add user authentication if needed
- Use HTTPS in production

### 5. Enhanced Features with Claude
With Claude integration, you can:
- Answer complex questions about the car
- Provide maintenance recommendations
- Explain warning lights
- Give driving tips
- Provide weather-aware suggestions
- Natural conversation flow

### 6. Example Enhanced Commands
- "Why is my check engine light on?"
- "When should I change my oil?"
- "What's the best tire pressure for highway driving?"
- "Explain what the boost gauge shows"
- "How can I improve my fuel economy?"

## Testing
1. Start your backend server
2. Open the Electron app
3. Navigate to Audi AI
4. Click the record button
5. Say a command
6. Claude will process and respond

## Next Steps
- Add conversation history
- Implement context awareness
- Add car diagnostics integration
- Create custom Claude instructions for your specific Audi model
- Add multi-language support