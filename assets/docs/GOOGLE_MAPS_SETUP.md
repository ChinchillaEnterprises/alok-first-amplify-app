# Google Maps API Setup Instructions

To enable Google Maps in the navigation screen, you need to get a Google Maps API key:

## Steps to Get Your API Key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to your domain for security

## Add Your API Key:

Open `index.html` and replace `YOUR_API_KEY` with your actual API key:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=places"></script>
```

## Features Included:

- Real-time map display with dark theme matching the Audi interface
- Search functionality with autocomplete
- Turn-by-turn navigation with route display
- Current location tracking
- Distance and ETA display
- Zoom controls
- Location centering
- Satellite/Map view toggle

## Note:
Without a valid API key, the map will show an error. The Google Maps API is a paid service after the free tier usage.