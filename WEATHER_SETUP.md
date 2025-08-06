# Weather API Setup Guide

## 🌤️ Overview
This Audi Infotainment System now includes a weather API integration using your existing Node.js backend server.

## 📋 Prerequisites
1. OpenWeatherMap API key (free at https://openweathermap.org/api)
2. Google Maps API key (you may already have this)

## 🚀 Setup Steps

### 1. Get API Keys
1. **OpenWeatherMap**: Go to https://openweathermap.org/api (free account)
2. **Google Maps**: Get from Google Cloud Console (you may already have this)

### 2. Configure Environment Variables
Create/update your `.env` file in the project root:
```env
# Add these to your existing .env file
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
CLAUDE_API_KEY=your_existing_claude_key
```

### 3. Start Backend Server
```bash
# Start your backend server (if not already running)
npm run dev
# or
node backend/server.js
```

### 4. Test Weather Integration
1. Open your Audi app in the browser
2. Allow location access when prompted
3. Check the status bar for live weather data
4. Weather updates automatically every 10 minutes

## 🔧 Features

### Current Implementation
- ✅ **Automatic Location**: Uses browser geolocation API
- ✅ **Real-time Updates**: Refreshes every 10 minutes
- ✅ **Dynamic Icons**: Weather-appropriate icons in status bar
- ✅ **Fallback Data**: Works even if location/API fails
- ✅ **Responsive Design**: Fits Audi's design language

### Weather Data Displayed
- Temperature (°F)
- Weather condition (Clear, Cloudy, Rain, etc.)
- Dynamic weather icon
- Location information

### UI Integration
- **Status Bar**: Shows current temperature and weather icon
- **Auto-refresh**: Updates automatically in background
- **Manual Refresh**: Can be triggered via `window.refreshWeather()`
- **Event System**: Emits `weatherUpdated` events for other components

## 🔐 Security
- API key stored as encrypted Amplify secret
- No sensitive data in frontend code
- HTTPS-only API calls
- Proper error handling with fallback data

## 🎯 Future Enhancements
- Weather alerts and notifications
- Extended forecast (7-day)
- Weather-based route suggestions
- Climate control integration
- Voice weather commands via Audi AI

## 🐛 Troubleshooting

### Location Not Working
- Browser might block geolocation
- Falls back to approximate US center coordinates
- Check browser permissions for location access

### API Not Responding
- Verify OpenWeatherMap API key is valid
- Check Amplify deployment status
- Review CloudWatch logs for Lambda function

### Weather Not Updating
- Check browser console for errors
- Verify network connectivity
- Manual refresh: `window.refreshWeather()`

## 📱 Development vs Production

### Development (Current)
- Uses mock weather data
- No backend deployment required
- Simulates API responses for testing

### Production (After Deployment)
- Real OpenWeatherMap API integration
- AWS Lambda backend processing
- Live weather updates based on actual location