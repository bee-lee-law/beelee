/**
 * Geospatial utility functions for distance calculations
 * Uses Haversine formula for lat/lng coordinates
 */

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Calculate perpendicular distance from a point to a line segment
 * Uses geographic coordinates (lat/lng)
 * @param {Array} point - [lat, lng]
 * @param {Array} segStart - [lat, lng] start of segment
 * @param {Array} segEnd - [lat, lng] end of segment
 * @returns {number} Distance in meters
 */
export function pointToSegmentDistanceGeo(point, segStart, segEnd) {
  const [pointLat, pointLon] = point;
  const [startLat, startLon] = segStart;
  const [endLat, endLon] = segEnd;

  // Calculate the projection parameter t
  const A = pointLat - startLat;
  const B = pointLon - startLon;
  const C = endLat - startLat;
  const D = endLon - startLon;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  // If segment has zero length, return distance to start point
  if (lenSq === 0) {
    return haversineDistance(pointLat, pointLon, startLat, startLon);
  }

  let param = dot / lenSq;

  // Clamp parameter to [0, 1]
  let closestLat, closestLon;
  if (param < 0) {
    closestLat = startLat;
    closestLon = startLon;
  } else if (param > 1) {
    closestLat = endLat;
    closestLon = endLon;
  } else {
    closestLat = startLat + param * C;
    closestLon = startLon + param * D;
  }

  // Calculate distance from point to closest point on segment
  return haversineDistance(pointLat, pointLon, closestLat, closestLon);
}

/**
 * Calculate minimum distance between two line segments
 * @param {Array} seg1Start - [lat, lng] start of first segment
 * @param {Array} seg1End - [lat, lng] end of first segment
 * @param {Array} seg2Start - [lat, lng] start of second segment
 * @param {Array} seg2End - [lat, lng] end of second segment
 * @returns {number} Minimum distance in meters
 */
export function segmentToSegmentDistance(seg1Start, seg1End, seg2Start, seg2End) {
  // Calculate distances from all endpoints to opposite segments
  const distances = [
    pointToSegmentDistanceGeo(seg1Start, seg2Start, seg2End),
    pointToSegmentDistanceGeo(seg1End, seg2Start, seg2End),
    pointToSegmentDistanceGeo(seg2Start, seg1Start, seg1End),
    pointToSegmentDistanceGeo(seg2End, seg1Start, seg1End)
  ];

  return Math.min(...distances);
}
