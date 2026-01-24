"use client"

import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { geocodeLocation } from '@/src/utils/geocoding';
import { analyzeRouteCoverage } from '@/src/utils/routeAnalysis';
import { decodePolyline } from '../../src/utils/polylineDecoder';
import { locationList } from '@/src/utils/locationList';

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
    let xmax = String(Math.max(...longs));
    let ymax = String(Math.max(...lats));
    console.log(xmin + ',' + ymin + ',' + xmax + ',' + ymax);
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
    setIsLoadingCollisions(false);
    setCollisionData({});
    setRouteAnalysis(null);
    if(laneData.error){
      setLaneData([])
      setIsLoadingLanes(false);
    }
  };

  const randomize = () => {
    const index1 = Math.floor(Math.random() * locationList.length);
    let index2 = Math.floor(Math.random() * locationList.length);
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * locationList.length);
    }
    const location1 = locationList[index1];
    const location2 = locationList[index2];

    setRouteData([]);
    setCollisionData({});
    setRouteAnalysis(null);
    setIsLoadingRoute(false);
    setIsLoadingCollisions(false);
    setUserInput({
      origin: {
        lat: parseFloat(location1.lat),
        lng: parseFloat(location1.lng),
        loc_name: location1.loc_name,
        address: location1.address || {}
      },
      destination: {
        lat: parseFloat(location2.lat),
        lng: parseFloat(location2.lng),
        loc_name: location2.loc_name,
        address: location2.address || {}
      }
    });
  }

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
    if(routeData.length <= 0 || isLoadingCollisions || collisionData?.data?.collisions?.length > 0) return;
    async function fetchCollisionData(){
      setIsLoadingCollisions(true);
      const collisionInfo = await getCollisions(routeData);
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

  // Collision filter state
  const [collisionFilters, setCollisionFilters] = useState({
    maxDistance: 100,        // meters
    minSeverity: 0,          // 0-3
    maxSafetyRating: 10,     // 0-10
    bicycleOnly: false,
    showCollisions: true
  });

  // Run route analysis when route, lane, and collision data are available
  useEffect(() => {
    if (routeData?.routes && laneData?.data?.bikeLanes) {
      try {
        const analysis = analyzeRouteCoverage(routeData, laneData, collisionData, 15);
        setRouteAnalysis(analysis);
        console.log('Route Analysis:', analysis);
      } catch (error) {
        console.error('Failed to analyze route:', error);
        setRouteAnalysis(null);
      }
    } else {
      setRouteAnalysis(null);
    }
  }, [routeData, laneData, collisionData]);

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
              collisions={routeAnalysis?.collisions}
              collisionFilters={collisionFilters}
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
              randomize={randomize}
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
              collisionFilters={collisionFilters}
              setCollisionFilters={setCollisionFilters}
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
  randomize,
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

  const isRouteFound = routeData?.routes?.length > 0;

  const getHintText = () => {
    if(laneData.error) return laneData.error
    if(isLoadingLanes && laneData.length === 0) return 'Fetching bike lanes'
    else if(searchMode === 'origin' && !userInput.origin) return 'Selecting Origin'
    else if(searchMode === 'destination' && !userInput.destination) return 'Selecting Destination'
    else if(isLoadingRoute && !routeData) return 'Calculating Route'
    else if(isRouteFound) return 'Click 🎲 or ↻ to search again'
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
      <button
        style={{
          ...modeButtonStyle,
          opacity: isRouteFound ? 0.5 : 1,
          cursor: isRouteFound ? 'not-allowed' : 'pointer',
        }}
        onClick={onModeToggle}
        disabled={isRouteFound}
      >
        {searchMode === 'origin' ? '🔵 Origin' : '🟢 Destination'}
      </button>

      <div style={inBoxContainerStyle}>
        <div style={{
          ...inBoxStyle,
          opacity: isRouteFound ? 0.5 : 1,
          cursor: isRouteFound ? 'not-allowed' : 'text',
        }}>
          <input
            ref={inputRef}
            style={{
              paddingLeft: '10px',
              height: '100%',
              outline: 'none',
              border: 'none',
              background: 'transparent',
              flex: 1,
              cursor: isRouteFound ? 'not-allowed' : 'text',
            }}
            type='text'
            placeholder={isRouteFound ? 'Route locked - reset to search again' : `Search for ${searchMode}...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isRouteFound}
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
      <div style={{display: 'flex', gap: '8px'}}>
        <button
          style={{
            background: 'linear-gradient(180deg, rgba(240, 240, 240, 0.9) 0%, rgba(200, 200, 200, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.15s ease',
          }}
          onClick={randomize}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          title="Random locations"
        >
          &#127922;
        </button>
        <button
          style={{
            background: 'linear-gradient(180deg, rgba(240, 240, 240, 0.9) 0%, rgba(200, 200, 200, 0.9) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            borderRadius: '6px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.15s ease',
          }}
          onClick={onReset}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          title="Reset"
        >
          ↻
        </button>
      </div>
    </div>
  )
}

function OutputBar({ containerHeight, userInput, routeAnalysis, collisionFilters, setCollisionFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCoverageBreakdown, setShowCoverageBreakdown] = useState(false);
  const [showCollisionBreakdown, setShowCollisionBreakdown] = useState(false);
  const heightPercent = isExpanded ? 50 : 15;

  const toggleHeight = () => {
    setIsExpanded(!isExpanded);
  };

  // Helper to get address name from location getAddressName
  const getAddressName = (location) => {
    if (!location || !location.address) return 'Unknown';
    if(location.loc_name) return location.loc_name;
    const num = location.address.house_number;
    const st = location.address.road;
    return num + ' ' + st
  };

  const getCity = (address) => {
    return address.city || address.town || 'NA';
  }

  // Generate summary text for collapsed view
  const getSummaryText = () => {
    console.log(userInput);
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

  const getSafetyRating = (inRating) => {
    let grade, color;
    if(inRating < .1) { grade = "F"; color = "#b91c1c"; }
    else if(inRating < .2) { grade = "D"; color = "#dc2626"; }
    else if(inRating < .3) { grade = "C-"; color = "#ea580c"; }
    else if(inRating < .4) { grade = "C"; color = "#f97316"; }
    else if(inRating < .5) { grade = "C+"; color = "#fb923c"; }
    else if(inRating < .6) { grade = "B-"; color = "#fbbf24"; }
    else if(inRating < .7) { grade = "B"; color = "#facc15"; }
    else if(inRating < .8) { grade = "B+"; color = "#a3e635"; }
    else if(inRating < .85) { grade = "A-"; color = "#86efac"; }
    else if(inRating < .9) { grade = "A"; color = "#4ade80"; }
    else { grade = "A+"; color = "#22c55e"; }
    return <span style={{ color, fontWeight: 'bold' }}>&nbsp;{grade}&nbsp;</span>;
  }

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
            {/* Route Coverage Analysis */}
            {routeAnalysis && !routeAnalysis.error && (
              <>
              <div style={{fontSize: '14px', fontWeight: 'bold'}}>
                {getSummaryText()}
                <br/>
                <h4 style={{marginBottom: '10px', marginTop: '5px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>Overall Safety Rating: {getSafetyRating(routeAnalysis.summary.collisionAdjustedRating)} ({routeAnalysis.summary.collisionAdjustedRating.toFixed(2)})</h4>
              </div>
              <div style={{marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #444'}}>
                <h3 style={{marginTop: 0, fontSize: '16px', textAlign: 'right'}}>Coverage Analysis</h3>
                <hr/>

                <div style={{marginBottom: '15px'}}>
                  <p style={{margin: '4px 0', fontSize: '13px'}}>
                    Total Distance: {routeAnalysis.totalDistanceKm.toFixed(2)} km ({routeAnalysis.totalDistanceMiles.toFixed(2)} mi)
                  </p>
                  <p>
                    Bike Infra Coverage: {routeAnalysis.summary.totalCoveredPercentage.toFixed(1)}%
                  </p>
                </div>
                <h4 style={{marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                  Infrastructure Rating: {routeAnalysis.summary.averageSafetyRating.toFixed(2)}
                  <span
                    onClick={() => setShowCoverageBreakdown(!showCoverageBreakdown)}
                    style={{
                      marginLeft: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: showCoverageBreakdown ? 'rgba(100, 100, 100, 0.8)' : 'rgba(100, 100, 100, 0.5)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'normal',
                    }}
                  >
                    ?
                  </span>
                </h4>

                {showCoverageBreakdown && (
                  <>
                    <div style={{marginBottom: '8px'}}>
                      <span style={{color: '#22c55e', fontSize: '16px'}}>●</span>
                      <span style={{marginLeft: '8px', fontSize: '13px'}}>
                        A. Dedicated Bike Path: <strong>{routeAnalysis.coverage.rating3.percentage.toFixed(1)}%</strong>
                      </span>
                      <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                        ({(routeAnalysis.coverage.rating3.distance / 1000).toFixed(2)} km)
                      </span>
                    </div>

                    <div style={{marginBottom: '8px'}}>
                      <span style={{color: '#06b6d4', fontSize: '16px'}}>●</span>
                      <span style={{marginLeft: '8px', fontSize: '13px'}}>
                        B. Bike Lane: <strong>{routeAnalysis.coverage.rating2.percentage.toFixed(1)}%</strong>
                      </span>
                      <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                        ({(routeAnalysis.coverage.rating2.distance / 1000).toFixed(2)} km)
                      </span>
                    </div>

                    <div style={{marginBottom: '8px'}}>
                      <span style={{color: '#3b82f6', fontSize: '16px'}}>●</span>
                      <span style={{marginLeft: '8px', fontSize: '13px'}}>
                        C. Shared Lanes: <strong>{routeAnalysis.coverage.rating1.percentage.toFixed(1)}%</strong>
                      </span>
                      <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                        ({(routeAnalysis.coverage.rating1.distance / 1000).toFixed(2)} km)
                      </span>
                    </div>

                    <div style={{marginBottom: '8px'}}>
                      <span style={{color: '#6b7280', fontSize: '16px'}}>●</span>
                      <span style={{marginLeft: '8px', fontSize: '13px'}}>
                        D. No Infra: <strong>{routeAnalysis.coverage.noLane.percentage.toFixed(1)}%</strong>
                      </span>
                      <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                        ({(routeAnalysis.coverage.noLane.distance / 1000).toFixed(2)} km)
                      </span>
                    </div>
                    <div style={{marginBottom: '8px'}}>
                      <span style={{marginLeft: '8px', fontSize: '11px', color: '#aaa'}}>
                        Safety Rating = (distanceA*1.0 + distanceB*0.8 + distanceC*0.5 + distanceD*0.0)/totalDistance
                      </span>
                    </div>
                  </>
                )}
              </div>
              </>
            )}

            {/* Collision Safety Analysis */}
            {routeAnalysis?.collisions && (
              <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #444'}}>
                <h3 style={{marginTop: 0, fontSize: '16px', textAlign: 'right'}}>
                  Traffic Collision Analysis
                </h3>
                <hr/>

                <div style={{marginBottom: '15px'}}>
                  <p style={{margin: '4px 0', fontSize: '13px'}}>
                    Collisions within 100m: {routeAnalysis.collisions.statistics.within100m}
                  </p>
                  <p>
                    Collisions within 50m: {routeAnalysis.collisions.statistics.within50m}
                  </p>
                </div>
                <h4 style={{marginBottom: '10px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center'}}>
                  Collision Impact: {(routeAnalysis.collisions.impact.safetyPenalty).toFixed(2)}
                  <span
                    onClick={() => setShowCollisionBreakdown(!showCollisionBreakdown)}
                    style={{
                      marginLeft: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: showCollisionBreakdown ? 'rgba(100, 100, 100, 0.8)' : 'rgba(100, 100, 100, 0.5)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'normal',
                    }}
                  >
                    ?
                  </span>
                </h4>
                {showCollisionBreakdown && (
                  <>
                  <h4 style={{marginBottom: '10px', fontSize: '14px'}}>By Severity:</h4>
                  <div style={{marginBottom: '8px', fontSize: '13px'}}>
                    <span style={{color: '#dc2626'}}>●</span> Serious Injury: {routeAnalysis.collisions.statistics.bySeverity.seriousInjury}
                  </div>
                  <div style={{marginBottom: '8px', fontSize: '13px'}}>
                    <span style={{color: '#f97316'}}>●</span> Minor Injury: {routeAnalysis.collisions.statistics.bySeverity.minorInjury}
                  </div>
                  <div style={{marginBottom: '8px', fontSize: '13px'}}>
                    <span style={{color: '#fbbf24'}}>●</span> Possible Injury: {routeAnalysis.collisions.statistics.bySeverity.possibleInjury}
                  </div>
                  <div style={{marginBottom: '8px', fontSize: '13px'}}>
                    <span style={{color: '#a3a3a3'}}>●</span> No Injury: {routeAnalysis.collisions.statistics.bySeverity.noInjury}
                  </div>

                  <h4 style={{marginTop: '15px', marginBottom: '10px', fontSize: '14px'}}>Risk Factors:</h4>
                  {routeAnalysis.collisions.statistics.riskFactors.bicycleInvolved > 0 && (
                    <div style={{marginBottom: '6px', fontSize: '12px'}}>
                      ⚠️ Bicycle Involved: {routeAnalysis.collisions.statistics.riskFactors.bicycleInvolved}
                    </div>
                  )}
                  {routeAnalysis.collisions.statistics.riskFactors.alcoholInvolved > 0 && (
                    <div style={{marginBottom: '6px', fontSize: '12px'}}>
                      ⚠️ Alcohol Involved: {routeAnalysis.collisions.statistics.riskFactors.alcoholInvolved}
                    </div>
                  )}
                  {routeAnalysis.collisions.statistics.riskFactors.aggressiveDriver > 0 && (
                    <div style={{marginBottom: '6px', fontSize: '12px'}}>
                      ⚠️ Aggressive Driving: {routeAnalysis.collisions.statistics.riskFactors.aggressiveDriver}
                    </div>
                  )}
                  {routeAnalysis.collisions.statistics.riskFactors.phoneInvolved > 0 && (
                    <div style={{marginBottom: '6px', fontSize: '12px'}}>
                      ⚠️ Phone Involved: {routeAnalysis.collisions.statistics.riskFactors.phoneInvolved}
                    </div>
                  )}
                </>
                )}
              </div>
            )}

            {/* No data available */}
            {!routeAnalysis && (
              <>
              <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #444'}}>
                <p style={{ fontSize: '13px'}}>
                  Enter Origin and Destination, or click the randomize button for a safety analysis
                </p>
              </div>
              </>
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
