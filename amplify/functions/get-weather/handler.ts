import type { Schema } from "../../data/resource";

export const handler: Schema["getWeather"]["functionHandler"] = async (event) => {
  const { latitude, longitude } = event.arguments;
  
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }
    
    // Call OpenWeatherMap Current Weather API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const weatherData = await response.json();
    
    // Format response to match our schema
    return {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0,
      city: weatherData.name,
      country: weatherData.sys.country
    };
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return fallback data in case of error
    return {
      temperature: 72,
      condition: "Unknown",
      description: "Weather data unavailable",
      icon: "01d",
      humidity: 50,
      windSpeed: 0,
      city: "Location",
      country: "US"
    };
  }
};