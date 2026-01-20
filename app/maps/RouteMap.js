"use client"

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import '../../src/utils/leafletConfig.js'
import { originIcon, destIcon } from '../../src/utils/customMarkers.js';
import { decodePolyline } from '../../src/utils/polylineDecoder';
import { createCollisionIcon, getCollisionOpacity } from '../../src/utils/collisionMarkers';

const GRCOORDS = [42.9613607, -85.6678049]

// MapController component for auto-zoom functionality
function MapController({ markers, route, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    // If we have decoded route coordinates, fit bounds to show the entire route
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (markers.origin && markers.destination) {
      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [markers.origin.lat, markers.origin.lng],
        [markers.destination.lat, markers.destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (markers.origin) {
      map.setView([markers.origin.lat, markers.origin.lng], 13);
    } else if (markers.destination) {
      map.setView([markers.destination.lat, markers.destination.lng], 13);
    }
  }, [markers, route, routeCoordinates, map]);

  return null;
}

export default function MapTesting({ borderRadius, markers = {}, route = {}, lanes = [], collisions = null, collisionFilters = {} }) {
  const position = GRCOORDS

  // Decode the geometry polyline if it exists
  const routeCoordinates = route.routes && route.routes[0] && route.routes[0].geometry
    ? decodePolyline(route.routes[0].geometry)
    : [];

  // Helper function to get color based on safety rating
  // Green to Blue spectrum with high contrast - all positive, with varying emphasis
  const getSafetyColor = (rating) => {
    switch(rating) {
      case 3:
        return '#22c55e'; // Bright lime green - safest
      case 2:
        return '#06b6d4'; // Cyan - good
      case 1:
        return '#3b82f6'; // Blue - decent
      default:
        return '#6b7280'; // Gray - unknown
    }
  };

  // Helper function to get line weight based on safety rating
  // Thicker lines = safer lanes (accessibility for colorblind users)
  const getSafetyWeight = (rating) => {
    switch(rating) {
      case 3:
        return 5; // Thickest - safest
      case 2:
        return 4; // Medium - good
      case 1:
        return 3; // Thinner - decent
      default:
        return 2.5; // Thinnest - unknown
    }
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ position: 'absolute', height: '100%', width: '100%', borderRadius: borderRadius }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Draw bike lanes with safety-based colors and weights */}
      {(lanes && lanes.data) && lanes.data.bikeLanes.map((lane, index) => {
        if (!lane.geometry || lane.geometry.length === 0) return null;

        const laneCoordinates = lane.geometry.map(point => [point.lat, point.lon]);
        const safetyRating = lane.safetyRating;
        const color = getSafetyColor(safetyRating);
        const weight = getSafetyWeight(safetyRating);

        return (
          <Polyline
            key={`lane-${lane.id || index}`}
            positions={laneCoordinates}
            color={color}
            weight={weight}
            opacity={0.6}
          >
            <Popup>
              <strong>{lane.tags?.name || 'Bike Lane'}</strong><br/>
              Safety Rating: {safetyRating || 'Unknown'}<br/>
              Type: {lane.tags?.highway || 'N/A'}
            </Popup>
          </Polyline>
        );
      })}

      {/* Draw route line using decoded geometry */}
      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          color="#000000"
          weight={4}
          opacity={0.7}
        />
      )}

      {/* Render collision markers */}
      {collisionFilters.showCollisions && collisions && collisions.nearRoute && collisions.nearRoute
        .filter(collision => {
          // Apply filters
          if (collisionFilters.maxDistance && collision.distance > collisionFilters.maxDistance) {
            return false;
          }
          if (collisionFilters.minSeverity !== undefined && collision.injuryRating < collisionFilters.minSeverity) {
            return false;
          }
          if (collisionFilters.maxSafetyRating !== undefined && collision.safetyRating > collisionFilters.maxSafetyRating) {
            return false;
          }
          if (collisionFilters.bicycleOnly && !collision.bicycleInvolved) {
            return false;
          }
          return true;
        })
        .map((collision) => {
          const position = [collision.location.lat, collision.location.lng];
          const icon = createCollisionIcon(collision);
          const opacity = getCollisionOpacity(collision.distance);

          return (
            <Marker
              key={`collision-${collision.id}`}
              position={position}
              icon={icon}
              opacity={opacity}
            >
              <Popup>
                <div style={{fontSize: '12px'}}>
                  <strong>{collision.type}</strong><br/>
                  <strong>Severity:</strong> {collision.severity}<br/>
                  <strong>Date:</strong> {new Date(collision.date).toLocaleDateString()}<br/>
                  <strong>Location:</strong> {collision.location_description}<br/>
                  <strong>Distance from route:</strong> {collision.distance.toFixed(0)}m<br/>
                  {collision.bicycleInvolved && <span style={{color: '#dc2626'}}>⚠️ Bicycle Involved</span>}
                  {collision.bicycleInvolved && <br/>}
                  {collision.alcoholInvolved && <span style={{color: '#dc2626'}}>⚠️ Alcohol Involved</span>}
                  {collision.alcoholInvolved && <br/>}
                  {collision.phoneInvolved && <span style={{color: '#dc2626'}}>⚠️ Phone Involved</span>}
                  {collision.phoneInvolved && <br/>}
                  {collision.aggressiveDriverInvolved && <span style={{color: '#dc2626'}}>⚠️ Aggressive Driving</span>}
                </div>
              </Popup>
            </Marker>
          );
        })
      }

      {/* Conditional marker rendering */}
      {markers.origin && (
        <Marker position={[markers.origin.lat, markers.origin.lng]} icon={originIcon}>
          <Popup>
            <strong>Origin</strong><br/>
            {markers.origin.display_name}
          </Popup>
        </Marker>
      )}

      {markers.destination && (
        <Marker position={[markers.destination.lat, markers.destination.lng]} icon={destIcon}>
          <Popup>
            <strong>Destination</strong><br/>
            {markers.destination.display_name}
          </Popup>
        </Marker>
      )}

      <MapController markers={markers} route={route} routeCoordinates={routeCoordinates} />
    </MapContainer>
  );
}
