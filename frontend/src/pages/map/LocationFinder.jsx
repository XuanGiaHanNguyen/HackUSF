import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon2Icon } from '../../assets/icon';
import { useNavigate } from 'react-router-dom';

const LocationFinder = ({ onLocationSelect }) => {

    const navigate = useNavigate();

    const [locationOption, setLocationOption] = useState(null);
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
    const [addressConfirmed, setAddressConfirmed] = useState(false);
    const [locationStatus, setLocationStatus] = useState({
        visible: false,
        type: 'info',
        message: ''
    });

    // Function to handle getting current location
    const handleCurrentLocation = () => {
        setIsLoading(true);
        setLocationStatus({
            visible: true,
            type: 'info',
            message: 'Getting your location...'
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Get coordinates
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    console.log("Latitude:", latitude);
                    console.log("Longitude:", longitude);
                    
                    // Reverse geocode to get address
                    reverseGeocode(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLoading(false);
                    
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
            setIsLoading(false);
            setLocationStatus({
                visible: true,
                type: 'error',
                message: 'Geolocation is not supported by this browser. Please enter your address manually.'
            });
        }
    };

    // Function to reverse geocode coordinates to get address
    const reverseGeocode = (lat, lng) => {
        // In a real app, this would call the Google Maps Geocoding API
        // For now, we'll simulate a delay and then set a sample address
        setTimeout(() => {
            const simulatedAddress = `${Math.floor(Math.random() * 1000)} Main St, Cityville, State ${Math.floor(Math.random() * 90000 + 10000)}`;
            setCurrentAddress(simulatedAddress);
            setIsLoading(false);
            setLocationStatus({
                visible: true,
                type: 'success',
                message: 'Location acquired successfully!'
            });
        }, 1000);
    };

    // Function to confirm the current location address
    const handleConfirmCurrentAddress = () => {
        setAddress(currentAddress);
        setAddressConfirmed(true);
        
        // Store address in local storage
        localStorage.setItem('userAddress', currentAddress);
        
        // Call the parent component callback with the location data
        if (onLocationSelect) {
            onLocationSelect({
                address: currentAddress,
                // In a real app, you would pass the coordinates too
                // lat: coordinates.lat,
                // lng: coordinates.lng
            });
        }
        
        console.log("Address confirmed:", currentAddress);
        
        // Navigate to new page
        // If using React Router:
        navigate('/map');
        // Or for simple redirection:
        // window.location.href = '/next-page';
    };


    // Function to handle address input changes
    const handleAddressChange = (e) => {
        const value = e.target.value;
        setAddress(value);
        
        // Mock function for Google Maps Places API
        if (value.length > 2) {
            // Simulating API call delay
            setTimeout(() => {
                // Mock suggestions - replace with actual Google Maps API call
                const mockSuggestions = [
                    `${value} Main Street, New York, NY`,
                    `${value} Broadway, Chicago, IL`,
                    `${value} Market Street, San Francisco, CA`,
                ];
                setSuggestions(mockSuggestions);
            }, 300);
        } else {
            setSuggestions([]);
        }
    };

    // Function to handle suggestion selection
    const handleSelectSuggestion = (suggestion) => {
        setAddress(suggestion);
        setSuggestions([]);
    };

    // Function to handle manual address search
    const handleAddressSearch = () => {
        if (address.trim()) {
            // In a real app, you would geocode this address to get coordinates
            setAddressConfirmed(true);
            
            // Store address in local storage
            localStorage.setItem('userAddress', address);
            
            // Call the parent component callback with the location data
            if (onLocationSelect) {
                onLocationSelect({
                    address: address,
                    // In a real app, you'd include coordinates from geocoding
                });
            }
            
            console.log("Using address:", address);
    
            setLocationStatus({
                visible: true,
                type: 'success',
                message: 'Address confirmed!'
            });
            
            // Navigate to new page
            // If using React Router:
            navigate('/map');
            // Or for simple redirection:
            // window.location.href = '/next-page';
        } else {
            setLocationStatus({
                visible: true,
                type: 'error',
                message: 'Please enter an address'
            });
        }
    };

    // Function to handle key press in the address input
    const handleAddressKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddressSearch();
        }
    };

    // Function to handle skip action
    const handleSkip = () => {
        // Navigate to the next step without a specific location
        if (onLocationSelect) {
            onLocationSelect({ skipped: true });
        }
        console.log("Skipped location setting");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-[rgba(235,228,220,255)]">
            <div className="flex flex-row justify-between align-between w-full py-4 pt-6 px-14">
                <div className="flex flex-row gap-2 text-lg font-bold">
                    {Icon2Icon}
                    <h2 className="font-bold text-3xl text-[#7c5b00]">SkinIntel</h2>
                </div>
                <div className="flex flex-row gap-5">
                    <div className="bg-[#7c5b00] rounded-lg px-6 py-2 text-sm text-white font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer">
                        <Link to="/">Home</Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto py-12 px-4">
                {/* Page Title */}
                <h1 className="text-5xl font-bold text-[#4a3600] text-center mb-4">Find Nearby Cancer Treatment Centers</h1>

                {/* Page Subtitle */}
                <p className="text-gray-600 text-center text-lg mb-16">
                    Locate specialized cancer treatment facilities near you for early diagnosis and care
                </p>

                {/* Search Container */}
                <div className="max-w-4xl mx-auto rounded-xl overflow-hidden mb-2 bg-white shadow-md">
                    {/* Middle section with location options */}
                    <div className="px-6 pt-8">
                        {locationOption === null ? (
                            <div className="space-y-5">
                                {/* Option 1: Use Current Location */}
                                <button 
                                    onClick={() => setLocationOption('current')}
                                    className="w-full bg-[#7c5b00] transition-colors duration-200 hover:bg-[#513E28] text-white py-4 px-4 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-lg font-medium">Use Current Location</span>
                                </button>
                                
                                {/* Option 2: Enter an Address */}
                                <button 
                                    onClick={() => setLocationOption('enter')}
                                    className="w-full bg-white border-2 border-[#7c5b00] text-[#7c5b00] transition-colors duration-200 hover:bg-[#7c5b00]/10 py-4 px-4 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="text-lg font-medium">Enter an Address</span>
                                </button>
                            </div>
                        ) : locationOption === 'current' ? (
                            <div className="py-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-4">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7c5b00]"></div>
                                    </div>
                                ) : currentAddress ? (
                                    <div className="text-center">
                                        <div className="mb-4 p-4 bg-white rounded-lg border border-yellow-900">
                                            <p className="text-lg text-gray-700 mb-2">Your current location:</p>
                                            <p className="font-semibold text-[#513E28]">{currentAddress}</p>
                                        </div>
                                        {addressConfirmed ? (
                                            <div className="bg-green-100 p-4 rounded-lg mb-4">
                                                <p className="text-green-800 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Address confirmed! Proceeding to next step...
                                                </p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleConfirmCurrentAddress}
                                                className="bg-[#7c5b00] transition-colors duration-200 hover:bg-[#513E28] text-white py-3 px-6 rounded-lg"
                                            >
                                                Accept This Address
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-lg text-gray-700 mb-4">Click below to find your current location</p>

                                        {locationStatus.visible && (
                                                <div className={`my-3 mb-4 p-3 rounded-lg ${
                                                    locationStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                                                    locationStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-[#7c5b00]'
                                                }`}>
                                                    <span>{locationStatus.message}</span>
                                                </div>
                                            )}

                                        <button 
                                            onClick={handleCurrentLocation}
                                            className="bg-[#7c5b00] transition-colors duration-200 hover:bg-[#513E28] text-white py-3 px-6 rounded-lg"
                                        >
                                            Get My Location
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 text-center">
                                    <button 
                                        onClick={() => {
                                            setLocationOption(null);
                                            setCurrentAddress('');
                                            setAddressConfirmed(false);
                                            setLocationStatus({ visible: false, type: 'info', message: '' });
                                        }}
                                        className="text-[#7c5b00] underline"
                                    >
                                        Back to options
                                    </button>
                                </div>
                            </div>
                        ) : locationOption === 'enter' ? (
                            <div className="py-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="addressInput"
                                        placeholder="Start typing your address..."
                                        value={address}
                                        onChange={handleAddressChange}
                                        onKeyPress={handleAddressKeyPress}
                                        className="w-full p-4 bg-white border border-yellow-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c5b00]"
                                    />
                                    
                                    {/* Address suggestions */}
                                    {suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg">
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleSelectSuggestion(suggestion)}
                                                >
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {suggestion}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {locationStatus.visible && (
                                    <div className={`mt-3 p-3 rounded-lg ${
                                        locationStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                                        locationStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-[#7c5b00]'
                                    }`}>
                                        <span>{locationStatus.message}</span>
                                    </div>
                                )}
                                
                                <div className="mt-4 flex justify-center">
                                    <button 
                                        onClick={handleAddressSearch}
                                        className="bg-[#7c5b00] transition-colors duration-200 hover:bg-[#513E28] text-white py-3 px-6 rounded-lg"
                                        disabled={!address.trim()}
                                    >
                                        Search with this Address
                                    </button>
                                </div>

                                <div className="mt-4 text-center">
                                    <button 
                                        onClick={() => {
                                            setLocationOption(null);
                                            setAddress('');
                                            setAddressConfirmed(false);
                                            setLocationStatus({ visible: false, type: 'info', message: '' });
                                        }}
                                        className="text-gray-500 underline cursor-pointer hover:text-gray-800"
                                    >
                                        Back to options
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Bottom section with skip option */}
                    <div className="p-6 pt-4">
                        <p 
                            onClick={locationOption === null ? () => handleSkip() : null}
                            className={`text-gray-500 text-center py-4 ${locationOption === null ? 'underline cursor-pointer hover:text-gray-800' : ''}`}
                        >
                            {locationOption === null ? 'Skip this step' : ''}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

<<<<<<< HEAD
export default HospitalFinder;
=======
export default LocationFinder;
>>>>>>> e05b2d5d9fecad2f7da327a1c6177a2bc4a7d1bc
