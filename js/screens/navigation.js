// Google Maps Navigation Integration
let map;
let directionsService;
let directionsRenderer;
let placesService;
let autocomplete;
let userLocation;
let destinationMarker;
let selectedPlace = null;

// Initialize map when Google Maps API loads
function initMap() {
    // Default location (will be overridden by user location)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    
    // Create map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 13,
        disableDefaultUI: true,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{ "color": "#1d2c4d" }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#8ec3b9" }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#1a3646" }]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#4b6878" }]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#64779e" }]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#4b6878" }]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#334e87" }]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [{ "color": "#023e58" }]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{ "color": "#283d6a" }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#6f9ba5" }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#1d2c4d" }]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#023e58" }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#3C7680" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{ "color": "#304a7d" }]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#98a5be" }]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#1d2c4d" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{ "color": "#2c6675" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#255763" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#b0d5ce" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#023e58" }]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#98a5be" }]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#1d2c4d" }]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#283d6a" }]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{ "color": "#3a4762" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#0e1626" }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#4e6d70" }]
            }
        ]
    });
    
    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#ff0000',
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    placesService = new google.maps.places.PlacesService(map);
    
    // Set up autocomplete for search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        autocomplete = new google.maps.places.Autocomplete(searchInput);
        autocomplete.bindTo('bounds', map);
        
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                alert("No details available for input: '" + place.name + "'");
                return;
            }
            
            // Store the selected place
            selectedPlace = place;
            
            // Show the place on map
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            
            // Add/update destination marker
            if (destinationMarker) {
                destinationMarker.setMap(null);
            }
            destinationMarker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }
            });
            
            // Show the Go button
            const navigateBtn = document.getElementById('navigate-btn');
            if (navigateBtn) {
                navigateBtn.style.display = 'block';
            }
        });
    }
    
    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                map.setZoom(15);
                
                // Add user location marker
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    },
                    title: 'Your Location'
                });
            },
            (error) => {
                // Location access denied or error
                console.log('Geolocation error:', error);
                // Still try to get approximate location from IP
                fetch('https://ipapi.co/json/')
                    .then(response => response.json())
                    .then(data => {
                        if (data.latitude && data.longitude) {
                            userLocation = {
                                lat: data.latitude,
                                lng: data.longitude
                            };
                            map.setCenter(userLocation);
                        }
                    })
                    .catch(err => console.log('IP location failed:', err));
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
    
    // Set up control buttons
    setupNavigationControls();
}

// Navigate to a place
function navigateToPlace(place) {
    if (!userLocation) {
        // If no user location, just show the place
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        
        // Add destination marker
        if (destinationMarker) {
            destinationMarker.setMap(null);
        }
        destinationMarker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
        });
        return;
    }
    
    // Calculate route
    const request = {
        origin: userLocation,
        destination: place.geometry.location,
        travelMode: google.maps.TravelMode.DRIVING
    };
    
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Display route information
            const route = result.routes[0];
            const duration = route.legs[0].duration.text;
            const distance = route.legs[0].distance.text;
            
            // Show navigation info (you can enhance this)
            showNavigationInfo(place.name, distance, duration);
        } else {
            alert('Could not calculate route: ' + status);
        }
    });
}

// Show navigation information
function showNavigationInfo(destination, distance, duration) {
    // Create or update navigation info overlay
    let infoOverlay = document.getElementById('nav-info-overlay');
    if (!infoOverlay) {
        infoOverlay = document.createElement('div');
        infoOverlay.id = 'nav-info-overlay';
        infoOverlay.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Roboto', sans-serif;
            z-index: 1000;
            min-width: 300px;
        `;
        document.getElementById('map').appendChild(infoOverlay);
    }
    
    infoOverlay.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #ff0000;">Navigation Active</h3>
        <p style="margin: 5px 0;"><strong>Destination:</strong> ${destination}</p>
        <p style="margin: 5px 0;"><strong>Distance:</strong> ${distance}</p>
        <p style="margin: 5px 0;"><strong>ETA:</strong> ${duration}</p>
        <button onclick="cancelNavigation()" style="
            margin-top: 10px;
            background: #ff0000;
            border: none;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
        ">Cancel Navigation</button>
    `;
}

// Cancel navigation
function cancelNavigation() {
    directionsRenderer.setDirections({routes: []});
    const overlay = document.getElementById('nav-info-overlay');
    if (overlay) {
        overlay.remove();
    }
    if (destinationMarker) {
        destinationMarker.setMap(null);
    }
    selectedPlace = null;
    
    // Clear search input and hide Go button
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    const navigateBtn = document.getElementById('navigate-btn');
    if (navigateBtn) {
        navigateBtn.style.display = 'none';
    }
}

// Set up navigation control buttons
function setupNavigationControls() {
    const controls = document.querySelectorAll('.nav-controls .control-btn');
    
    controls.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            switch(index) {
                case 0: // Zoom in
                    map.setZoom(map.getZoom() + 1);
                    break;
                case 1: // Zoom out
                    map.setZoom(map.getZoom() - 1);
                    break;
                case 2: // Center on user location
                    if (userLocation) {
                        map.setCenter(userLocation);
                        map.setZoom(15);
                    }
                    break;
                case 3: // Toggle map type
                    const currentType = map.getMapTypeId();
                    map.setMapTypeId(
                        currentType === 'roadmap' ? 'satellite' : 'roadmap'
                    );
                    break;
            }
        });
    });
    
    // Search button
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput && searchInput.value) {
                // Trigger autocomplete search
                google.maps.event.trigger(searchInput, 'focus');
                google.maps.event.trigger(searchInput, 'keydown', { keyCode: 13 });
            }
        });
    }
    
    // Navigate button
    const navigateBtn = document.getElementById('navigate-btn');
    if (navigateBtn) {
        navigateBtn.addEventListener('click', () => {
            if (selectedPlace && userLocation) {
                navigateToPlace(selectedPlace);
            } else if (!userLocation) {
                alert('Unable to get your current location. Please enable location services.');
            }
        });
    }
}

// Handle navigation screen activation
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize map when navigation screen is shown
    const navBtn = document.querySelector('[data-screen="navigation"]');
    if (navBtn) {
        navBtn.addEventListener('click', () => {
            // Initialize map if it hasn't been initialized
            if (typeof google !== 'undefined' && !map) {
                setTimeout(initMap, 100);
            }
        });
    }
});