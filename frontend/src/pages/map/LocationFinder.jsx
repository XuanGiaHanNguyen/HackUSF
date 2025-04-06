import React, { useState, useEffect, useRef } from 'react';
import { Icon2Icon } from '../../assets/icon';
import { Link } from 'react-router-dom';

const HospitalFinder = ({ googleMapsApiKey }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [addressInput, setAddressInput] = useState('');
    const [locationStatus, setLocationStatus] = useState({
        visible: false,
        type: 'info',
        message: ''
    });
    const [searchRadius, setSearchRadius] = useState(10);
    const [facilityTypes, setFacilityTypes] = useState({
        hospital: true,
        cancer_center: true,
        dermatologist: true
    });
    const [routeOptions, setRouteOptions] = useState({
        traffic: true,
        alternatives: true,
        travelMode: 'DRIVING'
    });
    const [facilities, setFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);

    const mapRef = useRef(null);
    const userMarkerRef = useRef(null);
    const facilityMarkersRef = useRef([]);
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const infoWindowRef = useRef(null);
    const routePolylinesRef = useRef([]);
    const autocompleteRef = useRef(null);
    const mapContainerRef = useRef(null);

    const routeColors = ['#4285F4', '#EA4335', '#FBBC05']; // Google colors for routes

    // Initialize map when component mounts
    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapContainerRef.current) return;

            // Default center (New York)
            const defaultCenter = { lat: 40.7128, lng: -74.0060 };

            const mapInstance = new window.google.maps.Map(mapContainerRef.current, {
                zoom: 10,
                center: defaultCenter,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
            }, []);

            mapRef.current = mapInstance;

            // Initialize directions service and renderer
            directionsServiceRef.current = new window.google.maps.DirectionsService();
            directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                map: mapInstance,
                suppressMarkers: false,
                preserveViewport: false,
                polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.8,
                    strokeWeight: 5
                }
            });

            // Initialize info window
            infoWindowRef.current = new window.google.maps.InfoWindow();

            // Initialize Google Places Autocomplete for address input
            const addressInputElement = document.getElementById('addressInput');
            if (addressInputElement) {
                autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputElement, {
                    types: ['address'],
                    fields: ['formatted_address', 'geometry']
                });

                // When a place is selected from the autocomplete dropdown
                autocompleteRef.current.addListener('place_changed', function () {
                    const place = autocompleteRef.current.getPlace();

                    if (!place.geometry) {
                        // User entered the name of a place that was not suggested
                        setLocationStatus({
                            visible: true,
                            type: 'error',
                            message: 'No location found for this address. Please select an address from the dropdown suggestions.'
                        });
                        return;
                    }

                    // Get the location from the place
                    const newLocation = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };

                    setUserLocation(newLocation);
                    setAddressInput(place.formatted_address);

                    // Update info text
                    setLocationStatus({
                        visible: true,
                        type: 'success',
                        message: 'Location set to: ' + place.formatted_address
                    });

                    // Update map
                    updateUserLocationOnMap(newLocation);
                });
            }
        };

        // Load Google Maps script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,geometry&v=weekly`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        } else {
            initMap();
        }
    }, [googleMapsApiKey]);

    // Update user location on map
    const updateUserLocationOnMap = (location) => {
        if (!mapRef.current || !location) return;

        // Clear existing user marker
        if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
        }

        // Add marker for user location
        userMarkerRef.current = new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            },
            title: 'Your Location'
        });

        // Center map on user location
        mapRef.current.setCenter(location);
        mapRef.current.setZoom(13);
    };

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLocationStatus({
                visible: true,
                type: 'info',
                message: 'Getting your location...'
            });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    setUserLocation(location);

                    // Update map
                    updateUserLocationOnMap(location);

                    // Update info text
                    setLocationStatus({
                        visible: true,
                        type: 'success',
                        message: 'Location acquired successfully! You can now search for nearby facilities.'
                    });

                    // Get address from coordinates for better UX
                    reverseGeocode(location);
                },
                (error) => {
                    let errorMessage = '';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enter your address manually.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable. Please enter your address manually.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please enter your address manually.';
                            break;
                        default:
                            errorMessage = 'Unknown error occurred. Please enter your address manually.';
                            break;
                    }

                    setLocationStatus({
                        visible: true,
                        type: 'error',
                        message: errorMessage
                    });
                }
            );
        } else {
            setLocationStatus({
                visible: true,
                type: 'error',
                message: 'Geolocation is not supported by this browser. Please enter your address manually.'
            });
        }
    };

    // Geocode address to get coordinates
    const geocodeAddress = (address) => {
        if (!window.google) return;

        setLocationStatus({
            visible: true,
            type: 'info',
            message: 'Finding address...'
        });

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ 'address': address }, (results, status) => {
            if (status === 'OK') {
                const location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };

                setUserLocation(location);

                // Update map
                updateUserLocationOnMap(location);

                // Update info text
                setLocationStatus({
                    visible: true,
                    type: 'success',
                    message: 'Address found! You can now search for nearby facilities.'
                });

                // Update address input with formatted address
                setAddressInput(results[0].formatted_address);
            } else {
                setLocationStatus({
                    visible: true,
                    type: 'error',
                    message: 'Could not find address. Please try again with a more specific address.'
                });
            }
        });
    };

    // Reverse geocode coordinates to get address
    const reverseGeocode = (location) => {
        if (!window.google) return;

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ 'location': location }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    setAddressInput(results[0].formatted_address);
                }
            }
        });
    };

    // Handle address search
    const handleAddressSearch = () => {
        if (addressInput.trim()) {
            geocodeAddress(addressInput.trim());
        } else {
            alert('Please enter an address');
        }
    };

    // Handle enter key press in address input
    const handleAddressKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddressSearch();
        }
    };

    // Find nearby facilities
    const findNearbyFacilities = () => {
        if (!userLocation || !window.google || !mapRef.current) {
            alert('Please set your location first');
            return;
        }

        // Clear existing markers
        clearFacilityMarkers();

        // Clear route display
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
        }

        // Clear alternative route polylines
        clearRoutePolylines();

        setSelectedRoute(null);
        setRouteDetails(null);

        // Get search parameters
        const radius = parseInt(searchRadius) * 1000; // Convert to meters
        const types = [];

        if (facilityTypes.hospital) types.push('hospital');
        if (facilityTypes.cancer_center) types.push('health');
        if (facilityTypes.dermatologist) types.push('doctor');

        if (types.length === 0) {
            alert('Please select at least one facility type');
            return;
        }

        // Create places service
        const service = new window.google.maps.places.PlacesService(mapRef.current);

        // Show loading state
        setLoadingFacilities(true);
        setFacilities([]);

        // Process each facility type
        let completedRequests = 0;
        let allResults = [];

        types.forEach(type => {
            const request = {
                location: userLocation,
                radius: radius,
                type: type
            };

            // Add cancer-specific keywords for better results
            if (type === 'hospital' || type === 'health') {
                request.keyword = 'cancer center oncology';
            } else if (type === 'doctor') {
                request.keyword = 'dermatologist skin cancer';
            }

            service.nearbySearch(request, (results, status) => {
                completedRequests++;

                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    // Add results to master list
                    allResults = allResults.concat(results);
                }

                // If all requests are complete, display results
                if (completedRequests === types.length) {
                    displayFacilityResults(allResults);
                }
            });
        });
    };

    // Display facility results
    const displayFacilityResults = (results) => {
        setLoadingFacilities(false);

        // Remove duplicates based on place_id
        const uniqueResults = Array.from(new Map(results.map(item => [item.place_id, item])).values());

        // Sort by distance
        const sortedResults = [...uniqueResults].sort((a, b) => {
            const distanceA = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                a.geometry.location
            );

            const distanceB = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                b.geometry.location
            );

            return distanceA - distanceB;
        });

        setFacilities(sortedResults);

        // Add markers for facilities
        sortedResults.forEach((place, index) => {
            addFacilityMarker(place, index);
        });
    };

    // Add facility marker to map
    const addFacilityMarker = (place, index) => {
        if (!window.google || !mapRef.current) return;

        const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapRef.current,
            title: place.name,
            label: {
                text: (index + 1).toString(),
                color: 'white'
            },
            animation: window.google.maps.Animation.DROP
        });

        // Add click listener to marker
        marker.addListener('click', () => {
            openInfoWindow(place, index);
        });

        facilityMarkersRef.current.push(marker);
    };

    // Open info window for a facility
    const openInfoWindow = (place, index) => {
        if (!window.google || !infoWindowRef.current) return;

        const marker = facilityMarkersRef.current[index];

        // Calculate distance
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
            place.geometry.location
        ) / 1000; // Convert to kilometers

        // Create info window content
        const content =
            <div style="max-width: 300px;">
                <h5>${place.name}</h5>
                <p>${place.vicinity || 'No address available'}</p>
                <p><strong>Distance:</strong> ${distance.toFixed(1)} km</p>
                ${place.rating ? `<p><strong>Rating:</strong> ${place.rating} ★ (${place.user_ratings_total} reviews)</p>` : ''}
                <button id="infowindow-directions-btn" class="px-3 py-1 bg-blue-500 text-white text-sm rounded" data-index="${index}">
                    <i class="bi bi-signpost-2-fill me-1"></i> Get Directions
                </button>
            </div>
            ;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);

        // Add event listener to the Get Directions button in the info window
        // This is added after a short delay to ensure the button exists in the DOM
        setTimeout(() => {
            const dirButton = document.getElementById('infowindow-directions-btn');
            if (dirButton) {
                dirButton.addEventListener('click', () => {
                    calculateAndDisplayRoute(place);
                });
            }
        }, 100);
    };

    // Clear facility markers from map
    const clearFacilityMarkers = () => {
        facilityMarkersRef.current.forEach(marker => {
            marker.setMap(null);
        });

        facilityMarkersRef.current = [];
    };

    // Clear route polylines
    const clearRoutePolylines = () => {
        routePolylinesRef.current.forEach(polyline => {
            polyline.setMap(null);
        });

        routePolylinesRef.current = [];
    };

    // Calculate and display route to a facility
    const calculateAndDisplayRoute = (destination) => {
        if (!userLocation || !window.google || !directionsServiceRef.current) {
            alert('Please set your location first');
            return;
        }

        // Get travel mode
        const travelMode = window.google.maps.TravelMode[routeOptions.travelMode];

        // Consider traffic if checkbox is checked
        const trafficModel = routeOptions.traffic ?
            window.google.maps.TrafficModel.BEST_GUESS : undefined;

        // Show alternative routes if checkbox is checked
        const provideAlternatives = routeOptions.alternatives;

        const request = {
            origin: userLocation,
            destination: destination.geometry.location,
            travelMode: travelMode,
            provideRouteAlternatives: provideAlternatives
        };

        // Add traffic model if needed
        if (travelMode === window.google.maps.TravelMode.DRIVING && trafficModel) {
            request.drivingOptions = {
                departureTime: new Date(),
                trafficModel: trafficModel
            };
        }

        directionsServiceRef.current.route(request, (response, status) => {
            if (status === 'OK') {
                // Clear existing markers
                clearFacilityMarkers();

                // Clear any existing route polylines
                clearRoutePolylines();

                // Close any open info windows
                infoWindowRef.current.close();

                if (provideAlternatives && response.routes.length > 1) {
                    // If we have alternative routes, render the primary one with the DirectionsRenderer
                    // and the alternates as polylines

                    // Display the main route
                    directionsRendererRef.current.setMap(mapRef.current);
                    directionsRendererRef.current.setDirections(response);
                    directionsRendererRef.current.setRouteIndex(0);

                    // Draw alternative routes as polylines
                    for (let i = 1; i < response.routes.length; i++) {
                        const route = response.routes[i];
                        const polyline = new window.google.maps.Polyline({
                            path: route.overview_path,
                            strokeColor: routeColors[i % routeColors.length],
                            strokeOpacity: 0.6,
                            strokeWeight: 4
                        });

                        polyline.setMap(mapRef.current);
                        routePolylinesRef.current.push(polyline);
                    }
                } else {
                    // Just display the main route
                    directionsRendererRef.current.setMap(mapRef.current);
                    directionsRendererRef.current.setDirections(response);
                }

                // Show route details
                setSelectedRoute(0);
                setRouteDetails(response);
            } else {
                alert('Directions request failed due to ' + status);
            }
        });
    };

    // Handle facility click
    const handleFacilityClick = (place, index) => {
        if (!mapRef.current) return;

        // Center map on selected facility
        mapRef.current.setCenter(place.geometry.location);
        mapRef.current.setZoom(16);

        // Open info window
        openInfoWindow(place, index);
    };

    // Handle route option click
    const handleRouteOptionClick = (routeIndex) => {
        if (!routeDetails || !mapRef.current || !window.google) return;

        setSelectedRoute(routeIndex);

        if (routeIndex === 0) {
            // For primary route, use the directions renderer
            directionsRendererRef.current.setRouteIndex(0);
            directionsRendererRef.current.setMap(mapRef.current);

            // Hide all polylines
            routePolylinesRef.current.forEach(polyline => {
                polyline.setMap(null);
            });
        } else {
            // For alternative route, hide the directions renderer
            // and show only the selected polyline
            directionsRendererRef.current.setMap(null);

            // Hide all polylines
            routePolylinesRef.current.forEach(polyline => {
                polyline.setMap(null);
            });

            // Show the selected route's polyline
            if (routeIndex - 1 < routePolylinesRef.current.length) {
                routePolylinesRef.current[routeIndex - 1].setMap(mapRef.current);
            }

            // Create markers for start and end points
            const route = routeDetails.routes[routeIndex];
            const leg = route.legs[0];

            // Add new start marker
            const startMarker = new window.google.maps.Marker({
                position: leg.start_location,
                map: mapRef.current,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    labelOrigin: new window.google.maps.Point(15, 10)
                },
                label: {
                    text: 'A',
                    color: 'white'
                }
            });

            // Add new end marker
            const endMarker = new window.google.maps.Marker({
                position: leg.end_location,
                map: mapRef.current,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    labelOrigin: new window.google.maps.Point(15, 10)
                },
                label: {
                    text: 'B',
                    color: 'white'
                }
            });

            // Add markers to the routePolylines array so they get cleaned up
            routePolylinesRef.current.push(startMarker);
            routePolylinesRef.current.push(endMarker);
        }
    };

    return (
        <div className="bg-[#f9f7f4] min-h-screen px-14">
            <div className="w-full">
                    <div className="flex flex-row justify-between align-between w-full pb-2 pt-6">
                        <div className="flex flex-row gap-2 text-lg font-bold">
                            {Icon2Icon}
                            <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
                        </div>
                        <div className="flex flex-row gap-5">
                            <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold transition-colors duration-300 shadow-sm">
                            <Link to="/aboutus">Reference</Link>
                            </div>
                        </div>
                    </div>
                </div>
            <h1 className="text-4xl font-bold mb-2 text-[#4a3600]">Find Nearby Cancer Treatment Centers</h1>
            <p className="text-gray-700 mb-6">Locate specialized cancer treatment facilities near you for early diagnosis and care</p>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Search, Filters, and Facilities */}
                <div className="w-full md:w-1/3">
                    {/* Search Section */}
                    <div className="bg-white rounded-lg shadow-md mb-4">
                        <div className="bg-[#8d733f] text-white p-3 rounded-t-lg">
                            <h3 className="text-xl font-bold justify-center items-center">Your Location</h3>
                        </div>
                        <div className="p-4">

                            <button
                                className="w-full bg-[#8d733f] hover:bg-[#4c3015] text-white py-2 px-4 rounded transition duration-300"
                                onClick={getCurrentLocation}
                            >
                                <svg
                                    className="w-5 h-5 mr-2 inline-block"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
                                    />
                                </svg>
                                Use My Current Location
                            </button>

                            <div className="mt-3">
                                <label
                                    htmlFor="addressInput"
                                    className="block text-sm font-medium text-foreground mb-1"
                                >
                                    Or enter your address:
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="addressInput"
                                        value={addressInput}
                                        onChange={(e) => setAddressInput(e.target.value)}
                                        onKeyPress={handleAddressKeyPress}
                                        className="flex-grow rounded-l border border-gray-300 px-3 py-2"
                                        placeholder="Enter your address"
                                    />
                                    <button
                                        onClick={handleAddressSearch}
                                        className="bg-[#d1c4a5] hover:bg-[#4c3015] px-4 py-2 rounded-r border border-l-0 border-gray-300 transition duration-300"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {locationStatus.visible && (
                                <div className={`mt-3 p-3 rounded-lg ${locationStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                                    locationStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-[#8d733f]'
                                    }`}>
                                    <i className={`bi ${locationStatus.type === 'success' ? 'bi-check-circle-fill' :
                                        locationStatus.type === 'error' ? 'bi-exclamation-circle-fill' :
                                            'bi-info-circle-fill'
                                        } mr-2`}></i>
                                    <span>{locationStatus.message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md mb-4">
                        <div className="bg-[#8d733f] text-white p-3 rounded-t-lg">
                            <h3 className="text-xl font-bold">Search Filters</h3>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <label htmlFor="searchRadius" className="block mb-1 font-medium">Search radius (km)</label>
                                <input
                                    type="range"
                                    id="searchRadius"
                                    min="1"
                                    max="50"
                                    value={searchRadius}
                                    onChange={(e) => setSearchRadius(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right"><span>{searchRadius}</span> km</div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium">Facility Type</label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="hospitalCheck"
                                            type="checkbox"
                                            checked={facilityTypes.hospital}
                                            onChange={(e) => setFacilityTypes({ ...facilityTypes, hospital: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="hospitalCheck" className="ml-2">Hospitals</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="cancerCenterCheck"
                                            type="checkbox"
                                            checked={facilityTypes.cancer_center}
                                            onChange={(e) => setFacilityTypes({ ...facilityTypes, cancer_center: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="cancerCenterCheck" className="ml-2">Cancer Treatment Centers</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="dermatologistCheck"
                                            type="checkbox"
                                            checked={facilityTypes.dermatologist}
                                            onChange={(e) => setFacilityTypes({ ...facilityTypes, dermatologist: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="dermatologistCheck" className="ml-2">Dermatologists</label>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-medium">Route Options</label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="trafficCheck"
                                            type="checkbox"
                                            checked={routeOptions.traffic}
                                            onChange={(e) => setRouteOptions({ ...routeOptions, traffic: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="trafficCheck" className="ml-2">Consider real-time traffic</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="alternativesCheck"
                                            type="checkbox"
                                            checked={routeOptions.alternatives}
                                            onChange={(e) => setRouteOptions({ ...routeOptions, alternatives: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="alternativesCheck" className="ml-2">Show alternative routes</label>
                                    </div>

                                    <label className="block mb-2 font-medium">Travel method</label>
                                    <div className="flex items-center">
                                        <input
                                            id="drivingMode"
                                            type="radio"
                                            name="travelMode"
                                            value="DRIVING"
                                            checked={routeOptions.travelMode === 'DRIVING'}
                                            onChange={() => setRouteOptions({ ...routeOptions, travelMode: 'DRIVING' })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="drivingMode" className="ml-2">
                                            <i className="fas fa-car mr-1"></i> Driving
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="walkingMode"
                                            type="radio"
                                            name="travelMode"
                                            value="WALKING"
                                            checked={routeOptions.travelMode === 'WALKING'}
                                            onChange={() => setRouteOptions({ ...routeOptions, travelMode: 'WALKING' })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="walkingMode" className="ml-2">
                                            <i className="fas fa-walking mr-1"></i> Walking
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="transitMode"
                                            type="radio"
                                            name="travelMode"
                                            value="TRANSIT"
                                            checked={routeOptions.travelMode === 'TRANSIT'}
                                            onChange={() => setRouteOptions({ ...routeOptions, travelMode: 'TRANSIT' })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="transitMode" className="ml-2">
                                            <i className="fas fa-bus mr-1"></i> Public Transit
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={findNearbyFacilities}
                                disabled={!userLocation}
                                className={`w-full py-2 text-white px-4 rounded transition duration-300 ${!userLocation
                                    ? 'bg-[#8d733f] cursor-not-allowed'
                                    : 'bg-[#8d733f] hover:[#8d733f]'
                                    }`}
                            >
                                <i className="bi bi-search mr-2"></i> Find Nearby Facilities
                            </button>
                        </div>
                    </div>

                  

                    <div className="text-center mt-4">
                        <a href="/" className="bg-[#8d733f] hover:bg-[#8d733f] text-white py-2 px-4 rounded transition duration-300">
                            Return to Home
                        </a>
                    </div>
                </div>

                {/* Right Column: Map and Route Details Side by Side */}
                <div className="w-full md:w-2/3">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Map Section */}
                        <div className="w-full md:w-7/12">
                            <div className="bg-white rounded-lg shadow-md h-full">
                                <div className="bg-[#8d733f] text-white p-3 rounded-t-lg">
                                    <h3 className="text-xl font-bold">Map</h3>
                                </div>
                                <div className="p-0">
                                    <div
                                        ref={mapContainerRef}
                                        className="w-full h-screen max-h-175"
                                        style={{ height: '700px' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Route Details Section */}
                        <div className="w-full md:w-5/12">
                            {routeDetails ? (
                                <div className="bg-white rounded-lg shadow-md h-full">
                                    <div className="bg-green-600 text-white p-3 rounded-t-lg">
                                        <h3 className="text-xl font-bold">Route Details</h3>
                                    </div>
                                    <div className="p-4 overflow-y-auto" style={{ maxHeight: '700px' }}>
                                        {/* Route Info */}
                                        <div className="mb-4">
                                            {routeDetails.routes && routeDetails.routes.length > 0 && (
                                                <>
                                                    <h4 className="text-lg font-semibold mb-2">
                                                        Route to {routeDetails.request ? routeDetails.request.destination.name : 'Destination'}
                                                    </h4>
                                                    <p className="mb-1">
                                                        <strong>Distance:</strong> {routeDetails.routes[selectedRoute].legs[0].distance.text}
                                                    </p>
                                                    <p className="mb-1">
                                                        <strong>Estimated Travel Time:</strong> {routeDetails.routes[selectedRoute].legs[0].duration.text}
                                                        {routeDetails.routes[selectedRoute].legs[0].duration_in_traffic &&
                                                            ` (with traffic: ${routeDetails.routes[selectedRoute].legs[0].duration_in_traffic.text})`}
                                                    </p>
                                                    <p className="mb-4">
                                                        <strong>Start:</strong> {routeDetails.routes[selectedRoute].legs[0].start_address}<br />
                                                        <strong>End:</strong> {routeDetails.routes[selectedRoute].legs[0].end_address}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* Alternative Routes */}
                                        {routeDetails.routes && routeDetails.routes.length > 1 && (
                                            <div className="mb-6">
                                                <h5 className="text-lg font-medium mb-2">Alternative Routes</h5>
                                                <div className="space-y-2">
                                                    {routeDetails.routes.map((route, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleRouteOptionClick(index)}
                                                            className={`p-3 rounded-lg border cursor-pointer ${selectedRoute === index
                                                                ? 'bg-[#8d733f] text-white border-[#8d733f]'
                                                                : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between">
                                                                <h6 className="font-medium">
                                                                    {index === 0 && (
                                                                        <span className="bg-green-500 text-white text-xs py-1 px-2 rounded mr-2">
                                                                            Recommended
                                                                        </span>
                                                                    )}
                                                                    Route {index + 1}
                                                                </h6>
                                                                <small>{route.legs[0].distance.text}</small>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className={selectedRoute === index ? 'text-white opacity-80' : 'text-gray-500'}>
                                                                    {route.legs[0].duration.text}
                                                                    {route.legs[0].duration_in_traffic &&
                                                                        ` (with traffic: ${route.legs[0].duration_in_traffic.text})`}
                                                                </span>
                                                                <span
                                                                    className="inline-block w-10 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: routeColors[index % routeColors.length] }}
                                                                ></span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step-by-Step Directions */}
                                        {routeDetails.routes && routeDetails.routes[selectedRoute] && (
                                            <div>
                                                <h5 className="text-lg font-medium mb-2">Step-by-Step Directions</h5>
                                                <div className="max-h-96 overflow-y-auto">
                                                    <ol className="border rounded-lg divide-y">
                                                        {routeDetails.routes[selectedRoute].legs[0].steps.map((step, index) => (
                                                            <li key={index} className="p-3">
                                                                <div dangerouslySetInnerHTML={{ __html: step.instructions }}></div>
                                                                <div className="text-sm text-gray-500">
                                                                    {step.distance.text} (about {step.duration.text})
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md h-full">
                                    <div className="bg-[#8d733f] text-white p-3 rounded-t-lg">
                                        <h3 className="text-xl font-bold">Route Details</h3>
                                    </div>
                                    <div className="p-4 flex items-center justify-center h-full">
                                        <div className="text-center text-gray-500 p-6">
                                            <i className="bi bi-signpost-2 text-4xl mb-4 block"></i>
                                            <p>Select a facility and click "Get Directions" to view route details.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalFinder;