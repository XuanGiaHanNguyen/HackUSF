import React, { useState, useEffect, useRef } from 'react';
import logo from "../../assets/logo.png"
import { Link } from 'react-router-dom';
const SearchLocation = ({ googleMapsApiKey }) => {
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [isLocation1Open, setIsLocation1Open] = useState(false);

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

    // Load user address from local storage when component mounts
    useEffect(() => {
        const storedAddress = localStorage.getItem('userAddress');
        if (storedAddress) {
            setAddressInput(storedAddress);
            // Geocode the stored address to get coordinates
            if (window.google && window.google.maps) {
                geocodeAddress(storedAddress);
            } else {
                // If Google Maps isn't loaded yet, set a flag to geocode later
                const checkGoogleMapsInterval = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(checkGoogleMapsInterval);
                        geocodeAddress(storedAddress);
                    }
                }, 500);

                // Clear interval if component unmounts
                return () => clearInterval(checkGoogleMapsInterval);
            }
        }
    }, []);

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

            // Initialize Google Places Autocomplete for address input if needed for updating location
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

                    // Store in localStorage
                    localStorage.setItem('userAddress', place.formatted_address);

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

            // If we already have a stored address from localStorage, try to geocode it now
            const storedAddress = localStorage.getItem('userAddress');
            if (storedAddress && !userLocation) {
                geocodeAddress(storedAddress);
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

                // Store in localStorage
                localStorage.setItem('userAddress', results[0].formatted_address);

                // Auto-search for facilities
                findNearbyFacilities(location);
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
                    localStorage.setItem('userAddress', results[0].formatted_address);
                }
            }
        });
    };

    // Find nearby facilities
    const findNearbyFacilities = (locationOverride) => {
        const locationToUse = locationOverride || userLocation;

        if (!locationToUse || !window.google || !mapRef.current) {
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
                location: locationToUse,
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
                    displayFacilityResults(allResults, locationToUse);
                }
            });
        });
    };

    // Display facility results
    const displayFacilityResults = (results, locationForDistance) => {
        setLoadingFacilities(false);

        // Remove duplicates based on place_id
        const uniqueResults = Array.from(new Map(results.map(item => [item.place_id, item])).values());

        // Sort by distance
        const sortedResults = [...uniqueResults].sort((a, b) => {
            const distanceA = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(locationForDistance.lat, locationForDistance.lng),
                a.geometry.location
            );

            const distanceB = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(locationForDistance.lat, locationForDistance.lng),
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
        const content = `
            <div style="max-width: 300px;">
                <h5>${place.name}</h5>
                <p>${place.vicinity || 'No address available'}</p>
                <p><strong>Distance:</strong> ${distance.toFixed(1)} km</p>
                ${place.rating ? `<p><strong>Rating:</strong> ${place.rating} ★ (${place.user_ratings_total} reviews)</p>` : ''}
                <button id="infowindow-directions-btn" class="px-3 py-1 bg-blue-500 text-white text-sm rounded" data-index="${index}">
                    <i class="bi bi-signpost-2-fill me-1"></i> Get Directions
                </button>
            </div>
        `;

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

    // Change address functionality
    const handleAddressInputChange = (e) => {
        setAddressInput(e.target.value);
    };

    const handleAddressKeyPress = (e) => {
        if (e.key === 'Enter') {
            geocodeAddress(addressInput);
        }
    };

    return (
        <div className="bg-[#f9f7f4] min-h-screen p-6">

            <div className="flex flex-row justify-between align-between w-full py-4 pt-6 mb-4">
                <div className="flex flex-row gap-2 text-lg font-bold">
                    <img src={logo} alt="SkinIntel Logo" className="h-10 w-auto" />
                    <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
                </div>
                <div className="flex flex-row gap-5">
                    <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold duration-300 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                        <Link to="/">Home</Link>
                    </div>
                </div>
            </div>


            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Search, Filters, and Facilities */}
                <div className="w-full md:w-1/3">
                    {/* Location Status Section */}
                    <div className="bg-white rounded-lg shadow-md mb-4">
                        {/* Clickable Header */}
                        <div
                            className="bg-[#8d733f] text-white p-3 rounded-lg cursor-pointer flex justify-between items-center"
                            onClick={() => setIsLocationOpen(!isLocationOpen)}
                        >
                            <h3 className="text-xl font-bold">Current Location</h3>
                            <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : 'rotate-0'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Toggleable Content */}
                        {isLocationOpen && (
                            <div className="p-4">
                                {addressInput ? (
                                    <div className="mb-2">
                                        <div className="font-medium text-gray-800">Using address:</div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-gray-600">{addressInput}</div>
                                            <button
                                                className="text-sm text-blue-500 hover:text-blue-700"
                                                onClick={() => {
                                                    document.getElementById('addressInput').focus();
                                                }}
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 text-gray-600">Loading saved address...</div>
                                )}

                                <div className="mt-2">
                                    <div className="flex">
                                        <input
                                            type="text"
                                            id="addressInput"
                                            value={addressInput}
                                            onChange={handleAddressInputChange}
                                            onKeyPress={handleAddressKeyPress}
                                            className="flex-grow rounded-l border border-gray-300 px-3 py-2"
                                            placeholder="Change your address"
                                        />
                                        <button
                                            onClick={() => geocodeAddress(addressInput)}
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
                        )}
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
                                    <div className="flex items-center pb-2">
                                        <input
                                            id="alternativesCheck"
                                            type="checkbox"
                                            checked={routeOptions.alternatives}
                                            onChange={(e) => setRouteOptions({ ...routeOptions, alternatives: e.target.checked })}
                                            className="w-4 h-4 text-[#8d733f]"
                                        />
                                        <label htmlFor="alternativesCheck" className="ml-2">Show alternative routes</label>
                                    </div>
                                    <label className="block mb-2 font-medium">Transportation Mean</label>
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
                                onClick={() => findNearbyFacilities()}
                                disabled={!userLocation}
                                className={`w-full py-2 px-4 rounded text-white font-medium transition duration-300 ${!userLocation
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#8d733f] hover:bg-[#4c3015]'
                                    }`}
                            >
                                <i className="bi bi-search mr-2"></i> Find Nearby Facilities
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Map and Route Details with Toggle */}
                <div className="w-full md:w-2/3">
                    <div className="bg-[#8d733f] text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="text-xl font-bold">Directions</h3>
                        <div className="flex items-center space-x-2 bg-[#6b562e] rounded-lg p-1">
                            <button
                                className={`px-3 py-1 text-sm rounded-lg transition duration-200 ${!isLocation1Open ? 'bg-white text-[#8d733f] font-medium' : 'text-white hover:bg-[#7a632f]'}`}
                                onClick={() => setIsLocation1Open(false)}
                            >
                                <i className="bi bi-map mr-1"></i> Map View
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded-lg transition duration-200 ${isLocation1Open ? 'bg-white text-[#8d733f] font-medium' : 'text-white hover:bg-[#7a632f]'}`}
                                onClick={() => setIsLocation1Open(true)}
                            >
                                <i className="bi bi-list-ul mr-1"></i> List View
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row">
                        {!isLocation1Open ? (
                            <>
                                {/* Map Section */}
                                <div className="w-full md:w-7/12">
                                    <div className="bg-white rounded-lg shadow-md h-full">
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
                                            <div className="p-4 flex items-center justify-center h-full">
                                                <div className="text-center text-gray-500 p-6">
                                                    <i className="bi bi-signpost-2 text-4xl mb-4 block"></i>
                                                    <p>Select a facility and click "Get Directions" to view route details.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* List View */
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-4">
                                    <div className="max-h-96 overflow-y-auto">
                                        {loadingFacilities ? (
                                            <div className="bg-blue-100 text-[#8d733f] p-3 rounded-lg">
                                                <i className="bi bi-arrow-repeat mr-2"></i>
                                                Searching for nearby facilities...
                                            </div>
                                        ) : facilities.length > 0 ? (
                                            <div>
                                                <p className="mb-3">Found {facilities.length} facilities near your stored location:</p>
                                                <div className="space-y-3">
                                                    {facilities.map((place, index) => {
                                                        // Calculate distance in kilometers
                                                        const distance = window.google && window.google.maps && userLocation ?
                                                            window.google.maps.geometry.spherical.computeDistanceBetween(
                                                                new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
                                                                place.geometry.location
                                                            ) / 1000 : 0; // Convert to kilometers

                                                        return (
                                                            <div
                                                                key={place.place_id}
                                                                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                                                onClick={() => handleFacilityClick(place, index)}
                                                            >
                                                                <div className="flex justify-between">
                                                                    <h5 className="font-medium">{place.name}</h5>
                                                                    <span className="text-[#8d733f]">{distance.toFixed(1)} km</span>
                                                                </div>
                                                                <p className="text-gray-600 mt-1 mb-2">{place.vicinity || 'No address available'}</p>
                                                                <div className="flex justify-between items-center">
                                                                    <small className="text-gray-500">
                                                                        {place.rating ? `Rating: ${place.rating} ★ (${place.user_ratings_total} reviews)` : 'No ratings available'}
                                                                    </small>
                                                                    <button
                                                                        className="bg-[#8d733f] hover:bg-[#8d733f] text-white py-1 px-3 rounded text-sm transition duration-300"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            calculateAndDisplayRoute(place);
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-signpost-2-fill mr-1"></i> Get Directions
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-blue-100 text-[#8d733f] p-3 rounded-lg">
                                                <i className="bi bi-info-circle-fill mr-2"></i>
                                                {localStorage.getItem('userAddress') ?
                                                    'Use the search filters to find facilities near your stored location.' :
                                                    'No location found in storage. Please set your location first.'
                                                }
                                            </div>

                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

export default SearchLocation;