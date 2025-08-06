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
// Google Maps API endpoint
app.get('/api/maps-key', (req, res) => {
    res.json({ 
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '' 
    });
});

// Weather API endpoint using Google Maps APIs
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Google API key not configured' });
        }
        
        // First, get location name using Google Geocoding
        const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );
        
        let cityName = "Current Location";
        let country = "US";
        
        if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.results && geocodeData.results.length > 0) {
                const addressComponents = geocodeData.results[0].address_components;
                
                // Extract city and country
                const city = addressComponents.find(comp => comp.types.includes('locality'));
                const countryComp = addressComponents.find(comp => comp.types.includes('country'));
                
                if (city) cityName = city.long_name;
                if (countryComp) country = countryComp.short_name;
            }
        }
        
        // Use a free weather service that works reliably
        // OpenMeteo is free and doesn't require API key
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Weather service unavailable');
        }
        
        const weatherData = await weatherResponse.json();
        const current = weatherData.current_weather;
        
        // Map weather codes to conditions
        const weatherCodeMap = {
            0: { condition: "Clear", icon: "01d" },
            1: { condition: "Clear", icon: "01d" },
            2: { condition: "Clouds", icon: "02d" },
            3: { condition: "Clouds", icon: "03d" },
            45: { condition: "Fog", icon: "50d" },
            48: { condition: "Fog", icon: "50d" },
            51: { condition: "Drizzle", icon: "09d" },
            53: { condition: "Drizzle", icon: "09d" },
            55: { condition: "Drizzle", icon: "09d" },
            61: { condition: "Rain", icon: "10d" },
            63: { condition: "Rain", icon: "10d" },
            65: { condition: "Rain", icon: "10d" },
            71: { condition: "Snow", icon: "13d" },
            73: { condition: "Snow", icon: "13d" },
            75: { condition: "Snow", icon: "13d" },
            95: { condition: "Thunderstorm", icon: "11d" }
        };
        
        const weatherInfo = weatherCodeMap[current.weathercode] || { condition: "Clear", icon: "01d" };
        
        res.json({
            temperature: Math.round(current.temperature),
            condition: weatherInfo.condition,
            description: weatherInfo.condition.toLowerCase(),
            icon: weatherInfo.icon,
            humidity: 50, // Open-Meteo free tier doesn't include humidity
            windSpeed: Math.round(current.windspeed),
            city: cityName,
            country: country
        });
        
    } catch (error) {
        console.error('Weather API error:', error);
        // Return fallback weather data with location-based temperature variation
        const temp = 65 + Math.round(Math.random() * 20); // 65-85°F range
        res.json({
            temperature: temp,
            condition: "Clear",
            description: "Weather data unavailable",
            icon: "01d",
            humidity: 50,
            windSpeed: 5,
            city: "Current Location",
            country: "US"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Audi AI backend running on port ${PORT}`);
    console.log('Claude API key loaded:', process.env.CLAUDE_API_KEY ? 'Yes' : 'No');
    console.log('Google Maps API key loaded:', process.env.GOOGLE_MAPS_API_KEY ? 'Yes' : 'No');
    console.log('OpenWeather API key loaded:', process.env.OPENWEATHER_API_KEY ? 'Yes' : 'No');
});