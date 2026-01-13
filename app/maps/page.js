"use client"

import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { geocodeLocation } from '@/src/utils/geocoding';
import { analyzeRouteCoverage } from '@/src/utils/routeAnalysis';
import { decodePolyline } from '../../src/utils/polylineDecoder';

// Dynamically import the map component with SSR disabled to avoid "window is not defined" error
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading map...</div>
});

async function getDirections(userInput) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/routes/directions?origin=${userInput.origin.lng},${userInput.origin.lat}&destination=${userInput.destination.lng},${userInput.destination.lat}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch route data');
  }
  const out = await response.json();
  console.log(out);
  return out;
}

  async function getLanes(city = 'Grand Rapids') {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/infrastructure/bike-lanes?city=${encodeURIComponent(city)}`;

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000); // 70 seconds

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('Failed to fetch bike lane data');
        return({error: 'Failed to fetch bike lane data, reset to try again'});
      }

      const out = await response.json();
      console.log(out);
      return out;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 70 seconds');
      }
      throw error;
    }
  }

  const getBounds = (coords) => {
    let longs = coords.map((coord)=>coord[1]);
    let lats = coords.map((coord)=>coord[0]);
    let xmin = String(Math.min(...longs));
    let ymin = String(Math.min(...lats));
    let xmax = String(Math.min(...longs));
    let ymax = String(Math.min(...lats));
    return xmin + ',' + ymin + ',' + xmax + ',' + ymax;
  }

  async function getCollisions(route) {
    // Get bounds from route
    const routeCoordinates = route.routes && route.routes[0] && route.routes[0].geometry
      ? decodePolyline(route.routes[0].geometry)
      : [];
    let suffix = getBounds(routeCoordinates);
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/safety/collisions?bounds=${suffix}`;

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000); // 70 seconds

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('Failed to fetch collision data');
        return({error: 'Failed to fetch collision data, reset to try again'});
      }

      const out = await response.json();
      console.log(out);
      return out;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 70 seconds');
      }
      throw error;
    }
  }

export default function Home() {
  const { isMobile, mounted } = useIsMobile();
  const screenSizeRef = useRef({ width: 600, height: 700, radius: 20, loaded: false });
  const [userInput, setUserInput] = useState({
    origin: null,
    destination: null,
  })

  // Autocomplete search state
  const [searchMode, setSearchMode] = useState('origin'); // 'origin' | 'destination'
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingLookup, setisLoadingLookup] = useState(false);
  const debounceTimerRef = useRef(null);


  useEffect(() => {
    if (!mounted) return; // Wait until mounted to initialize

    const updateScreenSize = () => {
      // Calculate responsive height based on viewport
      const viewportHeight = window.innerHeight;
      const mobileHeight = Math.min(viewportHeight - 100, 800); // Max 800px, leave 100px margin for mobile browser UI
      const desktopHeight = Math.min(viewportHeight - 100, 700); // Max 700px, leave 100px margin

      screenSizeRef.current = {
        width: isMobile ? 375 : 600,
        height: isMobile ? mobileHeight : desktopHeight,
        mapHeight: isMobile ? Math.floor(mobileHeight/1.8) : Math.floor(desktopHeight/1.8),
        radius: isMobile ? 10 : 20,
        loaded: true
      };
    };

    updateScreenSize();

    // Listen for resize/orientation changes
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [isMobile, mounted]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handler for search input with debouncing
  const handleSearchInput = (value) => {
    setSearchQuery(value);

    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timeout
    debounceTimerRef.current = setTimeout(async () => {
      if (value.trim().length >= 3) {
        setisLoadingLookup(true);
        try {
          const results = await geocodeLocation(value);
          console.log(results);
          setSuggestions(results);
        } catch (error) {
          console.error('Geocoding error:', error);
          setSuggestions([]);
        } finally {
          setisLoadingLookup(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);
  };

  // Handler for selecting a location from suggestions
  const handleLocationSelect = (location) => {
    // Update userInput with selected location
    setUserInput(prev => ({
      ...prev,
      [searchMode]: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        display_name: location.display_name,
        address: location.address || {}
      }
    }));

    // Auto-switch mode: origin → destination
    if (searchMode === 'origin') {
      setSearchMode('destination');
    }

    // Clear search state
    setSearchQuery('');
    setSuggestions([]);
  };

  // Handler for toggling between origin and destination mode
  const handleModeToggle = () => {
    setSearchMode(prev => prev === 'origin' ? 'destination' : 'origin');
    setSearchQuery('');
    setSuggestions([]);
  };

  // Handler for reset button
  const handleReset = () => {
    setUserInput({
      origin: null,
      destination: null,
    });
    setSearchMode('origin');
    setSearchQuery('');
    setSuggestions([]);
    setIsLoadingRoute(false);
    setRouteData([]);
    if(laneData.error){
      setLaneData([])
      setIsLoadingLanes(false);
    }
  };

  // Fetch lane data
  const [isLoadingLanes, setIsLoadingLanes] = useState(false);
  const [laneData, setLaneData] = useState([]);
  useEffect(() => {
    if(isLoadingLanes || laneData.length > 0) return;
    async function fetchData(){
      setIsLoadingLanes(true);
      const laneInfo = await getLanes();
      setLaneData(laneInfo);
    }
    fetchData();
    console.log('fetching lane data');
  }, []);

  // Route lookup handling
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState([]);
  useEffect(() => {
    if(isLoadingRoute || !userInput.origin || !userInput.destination || routeData.length > 0) return;
    async function fetchRouteData(){
      setIsLoadingRoute(true);
      const directionInfo = await getDirections(userInput);
      setRouteData(directionInfo);
    }
    try{
      fetchRouteData();
    }catch(e){
      console.error('Failed to fetch route data');
      setIsLoadingRoute(false);
    }
  }, [userInput]);

  //Get collision data when route data is available
  const [isLoadingCollisions, setIsLoadingCollisions] = useState(false);
  const [collisionData, setCollisionData] = useState();
  useEffect(() => {
    if(routeData.length <= 0 || isLoadingCollisions || collisionData.length > 0) return;
    async function fetchCollisionData(){
      setIsLoadingCollisions(true);
      const collisionInfo = await getCollisions(route);
      setCollisionData(collisionInfo);
    }
    try{
      fetchCollisionData();
    }catch(e){
      console.error('Failed to fetch collision data');
      setIsLoadingCollisions(false);
    }
  }, [routeData]);

  const [routeAnalysis, setRouteAnalysis] = useState(null);
  // Run route analysis when route, lane, and collision data are available
  useEffect(() => {
    if (routeData?.routes && laneData?.data?.bikeLanes && collisionData?.collisions) {
      try {
        const analysis = analyzeRouteCoverage(routeData, laneData, 15);
        setRouteAnalysis(analysis);
        console.log('Route Analysis:', analysis);
      } catch (error) {
        console.error('Failed to analyze route:', error);
        setRouteAnalysis(null);
      }
    } else {
      setRouteAnalysis(null);
    }
  }, [routeData, laneData]);

  const pageLayoutStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: 'black',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenSizeRef.current.width,
    height: screenSizeRef.current.height,
    borderRadius: screenSizeRef.current.radius,
  }

  if (!mounted) {
    return (
      <div style={{
        width: '600px',
        height: '700px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#fff5e4',
        borderRadius: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="max-w-2xl w-full">
        <div style={pageLayoutStyle}>
            <RouteMap
              borderRadius={screenSizeRef.current.radius}
              markers={userInput}
              route={routeData}
              lanes={laneData}
            />
            <InputBar
              searchMode={searchMode}
              searchQuery={searchQuery}
              suggestions={suggestions}
              isLoadingLookup={isLoadingLookup}
              onSearchChange={handleSearchInput}
              onSuggestionClick={handleLocationSelect}
              onModeToggle={handleModeToggle}
              onReset={handleReset}
              userInput={userInput}
              routeData={routeData}
              isLoadingRoute={isLoadingRoute}
              laneData={laneData}
              isLoadingLanes={isLoadingLanes}
            />
            <OutputBar
              containerHeight={screenSizeRef.current.height}
              userInput={userInput}
              routeAnalysis={routeAnalysis}
            />
        </div>
      </main>
    </div>
  );
}

function InputBar({
  searchMode,
  searchQuery,
  suggestions,
  isLoadingLookup,
  onSearchChange,
  onSuggestionClick,
  onModeToggle,
  onReset,
  userInput,
  routeData,
  isLoadingRoute,
  laneData,
  isLoadingLanes,
}){
  const inputRef = useRef(null);

  // Focus input on mount and when searchMode changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode]);

  const getHintText = () => {
    if(laneData.error)return laneData.error
    if(isLoadingLanes && laneData.length === 0) return 'Fetching bike lanes'
    else if(searchMode === 'origin' && !userInput.origin) return 'Selecting Origin'
    else if(searchMode === 'destination' && !userInput.destination) return 'Selecting Destination'
    else if(isLoadingRoute && !routeData) return 'Calculating Route'
    return 'Route found';
  }

  const barStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '10px',
    zIndex: 1000,
  }

  const modeButtonStyle = {
    background: searchMode === 'origin' ? 'rgba(37, 99, 235, 0.7)' : 'rgba(220, 38, 38, 0.7)',
    border: '1px solid black',
    borderRadius: '10px',
    padding: '5px 10px',
    cursor: 'pointer',
    color: 'white',
    fontSize: '12px',
    marginRight: '5px',
  }

  const inBoxContainerStyle = {
    position: 'relative',
    flex: 1,
    marginRight: '10px',
  }

  const inBoxStyle = {
    display: 'flex',
    flexDirection: 'row',
    border: '1px solid black',
    borderRadius: '10px',
    background: 'rgba(200, 200, 200, 0.7)',
    paddingRight: '5px',
    alignItems: 'center',
  }

  const dropdownStyle = {
    position: 'absolute',
    top: '35px',
    left: 0,
    right: 0,
    maxHeight: '300px',
    overflowY: 'auto',
    background: 'rgba(50, 50, 50, 0.95)',
    borderRadius: '10px',
    border: '1px solid rgba(200, 200, 200, 0.5)',
    zIndex: 1001,
  }

  const suggestionItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(200, 200, 200, 0.2)',
    color: '#fff',
    fontSize: '12px',
  }

  const suggestionItemHoverStyle = {
    background: 'rgba(100, 100, 100, 0.5)',
  }

  return(
    <div style={barStyle}>
      <button style={modeButtonStyle} onClick={onModeToggle}>
        {searchMode === 'origin' ? '🔵 Origin' : '🟢 Destination'}
      </button>

      <div style={inBoxContainerStyle}>
        <div style={inBoxStyle}>
          <input
            ref={inputRef}
            style={{paddingLeft: '10px', height: '100%', outline: 'none', border: 'none', background: 'transparent', flex: 1}}
            type='text'
            placeholder={`Search for ${searchMode}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {isLoadingLookup ? '⏳' : '🔍'}
        </div>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div style={dropdownStyle}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={suggestionItemStyle}
                onClick={() => onSuggestionClick(suggestion)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 100, 100, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{color: '#fff', fontSize: '12px', marginRight: '10px'}}>{getHintText()}</div>

      <button
        style={{
          background: 'rgba(200, 200, 200, 0.7)',
          border: '1px solid black',
          borderRadius: '10px',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
        onClick={onReset}
      >
        ↻
      </button>
    </div>
  )
}

function OutputBar({ containerHeight, userInput, routeAnalysis }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const heightPercent = isExpanded ? 50 : 15;

  const toggleHeight = () => {
    setIsExpanded(!isExpanded);
  };

  // Helper to get address name from location getAddressName
  const getAddressName = (location) => {
    if (!location || !location.address) return 'Unknown';
    const num = location.address.house_number;
    const st = location.address.road;
    return num + ' ' + st
  };

  const getCity = (address) => {
    return address.city || address.town || 'NA';
  }

  // Generate summary text for collapsed view
  const getSummaryText = () => {
    if(userInput.origin && userInput.origin.address && getCity(userInput.origin.address) != 'Grand Rapids') {
      return `Warning: Bike Lane and Traffic data not available outside of Grand Rapids`
    } else if (userInput.origin && userInput.destination) {
      return `${getAddressName(userInput.origin)} → ${getAddressName(userInput.destination)}`;
    } else if (userInput.origin) {
      return `Origin: ${getAddressName(userInput.origin)}`;
    } else if (userInput.destination) {
      return `Destination: ${getAddressName(userInput.destination)}`;
    }
    return 'No locations selected';
  };

  const barStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${heightPercent}%`,
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'height 0.3s ease',
  };

  const handleStyle = {
    width: '100%',
    height: '20px',
    background: 'rgba(100, 100, 100, 0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  };

  const contentStyle = {
    flex: 1,
    padding: '15px',
    fontSize: '13px',
  };

  return (
    <div style={barStyle}>
      <div
        style={handleStyle}
        onClick={toggleHeight}
      >
        {isExpanded ? '▼' : '▲'}
      </div>
      <div style={{...contentStyle, overflowY: isExpanded ? 'auto' : 'hidden'}}>
        <div style={{fontSize: '16px', fontWeight: 'bold', textAlign: 'right', overflow: isExpanded ? 'inherit' : 'hidden'}}>Route Safety Analysis</div>
        <hr />
        {!isExpanded ? (
          // Collapsed view - show summary
          <div style={{fontSize: '14px', fontWeight: 'bold'}}>
            {getSummaryText()}
          </div>
        ) : (
          // Expanded view - show detailed information
          <div>
            <h3 style={{marginTop: 0, marginBottom: '15px', fontSize: '16px'}}>Route Details</h3>

            {userInput.origin ? (
              <div style={{marginBottom: '20px'}}>
                <h4 style={{color: '#60a5fa', marginBottom: '8px', fontSize: '14px'}}>🔵 Origin</h4>
                <p style={{margin: '4px 0', fontSize: '12px'}}>{userInput.origin.display_name}</p>
                <p style={{margin: '4px 0', color: '#aaa', fontSize: '11px'}}>
                  Coordinates: {userInput.origin.lat.toFixed(4)}, {userInput.origin.lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div style={{marginBottom: '20px', color: '#888'}}>
                <h4 style={{marginBottom: '8px', fontSize: '14px'}}>🔵 Origin</h4>
                <p style={{fontSize: '12px'}}>Not selected</p>
              </div>
            )}

            {userInput.destination ? (
              <div>
                <h4 style={{color: '#f87171', marginBottom: '8px', fontSize: '14px'}}>🟢 Destination</h4>
                <p style={{margin: '4px 0', fontSize: '12px'}}>{userInput.destination.display_name}</p>
                <p style={{margin: '4px 0', color: '#aaa', fontSize: '11px'}}>
                  Coordinates: {userInput.destination.lat.toFixed(4)}, {userInput.destination.lng.toFixed(4)}
                </p>
              </div>
            ) : (
              <div style={{color: '#888'}}>
                <h4 style={{marginBottom: '8px', fontSize: '14px'}}>🟢 Destination</h4>
                <p style={{fontSize: '12px'}}>Not selected</p>
              </div>
            )}

            {/* Route Coverage Analysis */}
            {routeAnalysis && !routeAnalysis.error && (
              <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #444'}}>
                <h3 style={{marginTop: 0, marginBottom: '15px', fontSize: '16px'}}>Coverage Analysis</h3>

                <div style={{marginBottom: '15px'}}>
                  <p style={{margin: '4px 0', fontSize: '13px', fontWeight: 'bold'}}>
                    Total Distance: {routeAnalysis.totalDistanceKm.toFixed(2)} km ({routeAnalysis.totalDistanceMiles.toFixed(2)} mi)
                  </p>
                </div>

                <h4 style={{marginBottom: '10px', fontSize: '14px'}}>Bike Lane Coverage:</h4>

                <div style={{marginBottom: '8px'}}>
                  <span style={{color: '#22c55e', fontSize: '16px'}}>●</span>
                  <span style={{marginLeft: '8px', fontSize: '13px'}}>
                    Safest Lanes (Rating 3): <strong>{routeAnalysis.coverage.rating3.percentage.toFixed(1)}%</strong>
                  </span>
                  <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                    ({(routeAnalysis.coverage.rating3.distance / 1000).toFixed(2)} km)
                  </span>
                </div>

                <div style={{marginBottom: '8px'}}>
                  <span style={{color: '#06b6d4', fontSize: '16px'}}>●</span>
                  <span style={{marginLeft: '8px', fontSize: '13px'}}>
                    Good Lanes (Rating 2): <strong>{routeAnalysis.coverage.rating2.percentage.toFixed(1)}%</strong>
                  </span>
                  <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                    ({(routeAnalysis.coverage.rating2.distance / 1000).toFixed(2)} km)
                  </span>
                </div>

                <div style={{marginBottom: '8px'}}>
                  <span style={{color: '#3b82f6', fontSize: '16px'}}>●</span>
                  <span style={{marginLeft: '8px', fontSize: '13px'}}>
                    Decent Lanes (Rating 1): <strong>{routeAnalysis.coverage.rating1.percentage.toFixed(1)}%</strong>
                  </span>
                  <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                    ({(routeAnalysis.coverage.rating1.distance / 1000).toFixed(2)} km)
                  </span>
                </div>

                <div style={{marginBottom: '8px'}}>
                  <span style={{color: '#6b7280', fontSize: '16px'}}>●</span>
                  <span style={{marginLeft: '8px', fontSize: '13px'}}>
                    No Lane Coverage: <strong>{routeAnalysis.coverage.noLane.percentage.toFixed(1)}%</strong>
                  </span>
                  <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                    ({(routeAnalysis.coverage.noLane.distance / 1000).toFixed(2)} km)
                  </span>
                </div>

                <div style={{marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #444'}}>
                  <p style={{margin: '4px 0', fontSize: '13px'}}>
                    <strong>Overall Bike Lane Coverage: {routeAnalysis.summary.totalCoveredPercentage.toFixed(1)}%</strong>
                  </p>
                  <p style={{margin: '4px 0', fontSize: '12px', color: '#aaa'}}>
                    Average Safety Rating: {routeAnalysis.summary.averageSafetyRating.toFixed(2)} / 3.00
                  </p>
                </div>
              </div>
            )}

            {routeAnalysis && routeAnalysis.error && (
              <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #444'}}>
                <p style={{color: '#f87171', fontSize: '13px'}}>
                  Analysis Error: {routeAnalysis.error}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
