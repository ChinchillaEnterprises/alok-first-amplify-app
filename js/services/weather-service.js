// Weather Service for Audi Infotainment System
class WeatherService {
    constructor() {
        this.currentWeather = null;
        this.isLoading = false;
        this.lastUpdate = null;
        
        // Start getting weather data on initialization
        this.initialize();
    }
    
    async initialize() {
        // Get initial weather data
        await this.updateWeather();
        
        // Update weather every 10 minutes
        setInterval(() => {
            this.updateWeather();
        }, 10 * 60 * 1000);
    }
    
    async updateWeather() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            const position = await this.getCurrentLocation();
            
            if (position) {
                const weather = await this.fetchWeatherData(
                    position.coords.latitude, 
                    position.coords.longitude
                );
                
                this.currentWeather = weather;
                this.lastUpdate = new Date();
                this.updateWeatherUI();
                
                console.log('Weather updated:', weather);
            }
        } catch (error) {
            console.error('Failed to update weather:', error);
            this.setFallbackWeather();
        } finally {
            this.isLoading = false;
        }
    }
    
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                    console.warn('Geolocation error:', error);
                    // Use fallback coordinates (approximate US center)
                    resolve({
                        coords: {
                            latitude: 39.8283,
                            longitude: -98.5795
                        }
                    });
                },
                {
                    timeout: 10000,
                    maximumAge: 5 * 60 * 1000, // Cache for 5 minutes
                    enableHighAccuracy: false
                }
            );
        });
    }
    
    async fetchWeatherData(latitude, longitude) {
        try {
            // Use your existing backend server for weather data
            const response = await fetch(`http://localhost:3001/api/weather?lat=${latitude}&lng=${longitude}`);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const weatherData = await response.json();
            return weatherData;
            
        } catch (error) {
            console.error('Weather API error:', error);
            // Fallback to mock data if backend is not available
            return await this.getMockWeatherData(latitude, longitude);
        }
    }
    
    async getMockWeatherData(lat, lon) {
        // Mock data for development - will be replaced with real API
        const mockConditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
        const condition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
        
        return {
            temperature: Math.round(65 + Math.random() * 20), // 65-85°F
            condition: condition,
            description: condition.toLowerCase(),
            icon: '01d',
            humidity: Math.round(30 + Math.random() * 40), // 30-70%
            windSpeed: Math.round(Math.random() * 15), // 0-15 mph
            city: 'Current Location',
            country: 'US'
        };
    }
    
    setFallbackWeather() {
        this.currentWeather = {
            temperature: 72,
            condition: 'Clear',
            description: 'clear sky',
            icon: '01d',
            humidity: 50,
            windSpeed: 5,
            city: 'Location',
            country: 'US'
        };
        this.updateWeatherUI();
    }
    
    updateWeatherUI() {
        if (!this.currentWeather) return;
        
        // Update temperature in top status bar
        const tempElement = document.querySelector('.temp');
        if (tempElement) {
            tempElement.textContent = `${this.currentWeather.temperature}°F`;
        }
        
        // Update any weather display elements
        const weatherElements = document.querySelectorAll('[data-weather]');
        weatherElements.forEach(element => {
            const dataType = element.getAttribute('data-weather');
            
            switch (dataType) {
                case 'temperature':
                    element.textContent = `${this.currentWeather.temperature}°F`;
                    break;
                case 'condition':
                    element.textContent = this.currentWeather.condition;
                    break;
                case 'description':
                    element.textContent = this.currentWeather.description;
                    break;
                case 'city':
                    element.textContent = this.currentWeather.city;
                    break;
                case 'humidity':
                    element.textContent = `${this.currentWeather.humidity}%`;
                    break;
                case 'wind':
                    element.textContent = `${this.currentWeather.windSpeed} mph`;
                    break;
            }
        });
        
        // Emit weather update event for other components
        document.dispatchEvent(new CustomEvent('weatherUpdated', {
            detail: this.currentWeather
        }));
    }
    
    getWeatherIcon(iconCode) {
        // Map OpenWeather icon codes to Font Awesome icons
        const iconMap = {
            '01d': 'fas fa-sun', // clear sky day
            '01n': 'fas fa-moon', // clear sky night
            '02d': 'fas fa-cloud-sun', // few clouds day
            '02n': 'fas fa-cloud-moon', // few clouds night
            '03d': 'fas fa-cloud', // scattered clouds
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-clouds', // broken clouds
            '04n': 'fas fa-clouds',
            '09d': 'fas fa-cloud-rain', // shower rain
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain', // rain day
            '10n': 'fas fa-cloud-moon-rain', // rain night
            '11d': 'fas fa-bolt', // thunderstorm
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake', // snow
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog', // mist
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-question';
    }
    
    async refreshWeather() {
        await this.updateWeather();
    }
    
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    getLastUpdate() {
        return this.lastUpdate;
    }
}

// Create global weather service instance
window.weatherService = new WeatherService();
console.log('Weather Service initialized');