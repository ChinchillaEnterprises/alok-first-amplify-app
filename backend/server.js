const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Claude client
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// AI Assistant endpoint
app.post('/api/ai-assistant', async (req, res) => {
    try {
        const { command } = req.body;
        
        const message = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            messages: [{
                role: 'user',
                content: `You are an advanced Audi AI assistant integrated into a luxury car's infotainment system. 
                         The user said: "${command}". 
                         
                         You can control these car functions:
                         - tire_pressure: Check tire pressure status
                         - fuel_level: Show fuel level and range
                         - oil_life: Check oil life percentage
                         - odometer: Show mileage and trip data
                         - climate_set: Set temperature (extract number)
                         - climate_auto: Turn on auto climate
                         - seat_heat: Control seat heating
                         - seat_cool: Control seat cooling
                         - music_play: Play/pause music
                         - music_next: Next track
                         - music_prev: Previous track
                         - volume_set: Set volume level (0-100)
                         - navigate: Navigate to destination
                         - navigate_home: Navigate home
                         - navigate_work: Navigate to work
                         - home_screen: Go to home screen
                         - settings: Open settings
                         - phone: Open phone screen
                         - brightness_set: Adjust screen brightness (20-100)
                         - theme_set: Change theme (dark/light)
                         
                         You should:
                         1. Understand natural language and intent
                         2. Be conversational and helpful
                         3. Provide car-related information when asked
                         4. Handle questions about the car's features
                         5. Give driving tips if asked
                         6. Be personality-driven like a luxury car assistant
                         
                         If the user asks something you can't directly control (like "how's the weather"), 
                         still respond helpfully and suggest what you CAN do.
                         
                         Return JSON with format: 
                         { 
                           "action": "action_name or null", 
                           "response": "your natural, conversational response",
                           "parameters": {} // any extracted parameters
                         }
                         
                         Examples:
                         - "I'm cold" → climate_set with higher temp + "I'll warm things up for you"
                         - "Play some music" → music_play + "Starting your music"
                         - "How's my car doing?" → Suggest checking oil, fuel, tires
                         - "What can you do?" → Explain your capabilities conversationally`
            }]
        });
        
        // Parse Claude's response
        const content = message.content[0].text;
        let aiResponse;
        
        try {
            aiResponse = JSON.parse(content);
        } catch (e) {
            // If Claude didn't return valid JSON, create a simple response
            aiResponse = {
                action: null,
                response: content,
                parameters: {}
            };
        }
        
        res.json(aiResponse);
    } catch (error) {
        console.error('Claude API error:', error);
        res.status(500).json({ 
            error: 'AI service temporarily unavailable',
            fallback: true 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', ai: 'Claude' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Audi AI backend running on port ${PORT}`);
    console.log('Claude API key loaded:', process.env.CLAUDE_API_KEY ? 'Yes' : 'No');
});