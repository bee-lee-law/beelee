/**
 * Route analysis utility for comparing routes with bike lane data
 * Calculates coverage statistics and safety metrics
 */

import { decodePolyline } from './polylineDecoder';
import { haversineDistance, segmentToSegmentDistance } from './geoUtils';

/**
 * Decodes route geometry and normalizes to [lat, lng] format
 * @param {Object} routeData - Route data from getDirections()
 * @returns {Array} Array of [lat, lng] coordinates
 */
function decodeAndNormalizeRoute(routeData) {
  if (!routeData?.routes?.[0]?.geometry) return [];
  return decodePolyline(routeData.routes[0].geometry);
}

/**
 * Normalizes bike lane geometry to consistent format
 * @param {Object} laneData - Bike lane data from getLanes()
 * @returns {Array} Array of lane objects with normalized coordinates
 */
function normalizeLaneGeometry(laneData) {
  if (!laneData?.data?.bikeLanes) return [];
  return laneData.data.bikeLanes.map(lane => ({
    id: lane.id,
    name: lane.tags?.name || 'Unnamed Lane',
    safetyRating: lane.safetyRating || 0,
    coordinates: lane.geometry.map(pt => [pt.lat, pt.lon])
  }));
}

/**
 * Calculate distance between two coordinate points
 * @param {Array} point1 - [lat, lng]
 * @param {Array} point2 - [lat, lng]
 * @returns {number} Distance in meters
 */
function calculateSegmentDistance(point1, point2) {
  return haversineDistance(point1[0], point1[1], point2[0], point2[1]);
}

/**
 * Subdivide a route segment into smaller sub-segments if it's too long
 * This ensures we don't miss coverage gaps in the middle of long segments
 * @param {Array} start - [lat, lng] start point
 * @param {Array} end - [lat, lng] end point
 * @param {number} maxSegmentLength - Maximum length in meters before subdivision (default: 25m)
 * @returns {Array} Array of sub-segments [[start1, end1], [start2, end2], ...]
 */
function subdivideSegment(start, end, maxSegmentLength = 25) {
  const distance = calculateSegmentDistance(start, end);

  // If segment is short enough, return as-is
  if (distance <= maxSegmentLength) {
    return [[start, end]];
  }

  // Calculate how many subdivisions we need
  const numSegments = Math.ceil(distance / maxSegmentLength);
  const segments = [];

  // Create interpolated points
  for (let i = 0; i < numSegments; i++) {
    const t1 = i / numSegments;
    const t2 = (i + 1) / numSegments;

    const point1 = [
      start[0] + t1 * (end[0] - start[0]),
      start[1] + t1 * (end[1] - start[1])
    ];

    const point2 = [
      start[0] + t2 * (end[0] - start[0]),
      start[1] + t2 * (end[1] - start[1])
    ];

    segments.push([point1, point2]);
  }

  return segments;
}

/**
 * Finds the nearest bike lane to a route segment
 * @param {Array} segmentStart - [lat, lng]
 * @param {Array} segmentEnd - [lat, lng]
 * @param {Array} lanes - Array of normalized lane objects
 * @param {number} threshold - Distance threshold in meters
 * @returns {Object|null} Nearest lane if within threshold, null otherwise
 */
function findNearestLane(segmentStart, segmentEnd, lanes, threshold) {
  let nearestLane = null;
  let minDistance = Infinity;

  for (const lane of lanes) {
    for (let i = 0; i < lane.coordinates.length - 1; i++) {
      const laneSegStart = lane.coordinates[i];
      const laneSegEnd = lane.coordinates[i + 1];

      // Calculate distance between route segment and lane segment
      const distance = segmentToSegmentDistance(
        segmentStart, segmentEnd,
        laneSegStart, laneSegEnd
      );

      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        nearestLane = lane;
      }
    }
  }

  return nearestLane;
}

/**
 * Initialize empty result object
 * @returns {Object} Empty result structure
 */
function initializeResult() {
  return {
    totalDistance: 0,
    totalDistanceKm: 0,
    totalDistanceMiles: 0,
    coverage: {
      rating3: { distance: 0, percentage: 0, lanes: [] },
      rating2: { distance: 0, percentage: 0, lanes: [] },
      rating1: { distance: 0, percentage: 0, lanes: [] },
      noLane: { distance: 0, percentage: 0 }
    },
    summary: {
      totalCoveredDistance: 0,
      totalCoveredPercentage: 0,
      averageSafetyRating: 0,
      safestRoutePercentage: 0
    },
    segments: []
  };
}

/**
 * Update coverage statistics for a lane
 * @param {Object} result - Result object to update
 * @param {Object} lane - Lane object
 * @param {number} distance - Segment distance in meters
 */
function updateCoverageForLane(result, lane, distance) {
  const rating = lane.safetyRating;
  const ratingKey = `rating${rating}`;

  if (result.coverage[ratingKey]) {
    result.coverage[ratingKey].distance += distance;

    // Track which lanes were used
    const existingLane = result.coverage[ratingKey].lanes.find(l => l.id === lane.id);
    if (existingLane) {
      existingLane.distance += distance;
    } else {
      result.coverage[ratingKey].lanes.push({
        id: lane.id,
        name: lane.name,
        distance: distance
      });
    }
  }
}

/**
 * Update no-coverage statistics
 * @param {Object} result - Result object to update
 * @param {number} distance - Segment distance in meters
 */
function updateNoCoverage(result, distance) {
  result.coverage.noLane.distance += distance;
}

/**
 * Calculate percentages for all coverage categories
 * @param {Object} result - Result object to update
 */
function calculatePercentages(result) {
  if (result.totalDistance === 0) return;

  result.coverage.rating3.percentage = (result.coverage.rating3.distance / result.totalDistance) * 100;
  result.coverage.rating2.percentage = (result.coverage.rating2.distance / result.totalDistance) * 100;
  result.coverage.rating1.percentage = (result.coverage.rating1.distance / result.totalDistance) * 100;
  result.coverage.noLane.percentage = (result.coverage.noLane.distance / result.totalDistance) * 100;
}

/**
 * Calculate summary statistics
 * @param {Object} result - Result object to update
 */
function calculateSummary(result) {
  const totalCovered =
    result.coverage.rating3.distance +
    result.coverage.rating2.distance +
    result.coverage.rating1.distance;

  result.summary.totalCoveredDistance = totalCovered;
  result.summary.totalCoveredPercentage = (totalCovered / result.totalDistance) * 100;

  // Calculate weighted average safety rating
  const weightedSum =
    (result.coverage.rating3.distance * 3) +
    (result.coverage.rating2.distance * 2) +
    (result.coverage.rating1.distance * 1);

  result.summary.averageSafetyRating = totalCovered > 0
    ? weightedSum / totalCovered
    : 0;

  result.summary.safestRoutePercentage = result.coverage.rating3.percentage;
}

/**
 * Analyzes route coverage by bike lanes
 *
 * This function subdivides long route segments (>25m) to ensure accurate coverage
 * detection. This prevents false positives where a segment's endpoints are near
 * bike lanes but the middle portion is not covered.
 *
 * @param {Object} routeData - Route data from getDirections()
 * @param {Object} laneData - Bike lane data from getLanes()
 * @param {number} threshold - Distance threshold in meters (default: 15)
 * @returns {Object} Coverage analysis results
 */
export function analyzeRouteCoverage(routeData, laneData, threshold = 15) {
  try {
    // Validate inputs
    if (!routeData || !routeData.routes || routeData.routes.length === 0) {
      throw new Error('Invalid route data');
    }

    if (!laneData || !laneData.data || !laneData.data.bikeLanes) {
      throw new Error('Invalid lane data');
    }

    if (threshold <= 0 || threshold > 100) {
      throw new Error('Threshold must be between 0 and 100 meters');
    }

    // 1. Decode and normalize data
    const routeCoords = decodeAndNormalizeRoute(routeData);
    const lanes = normalizeLaneGeometry(laneData);

    if (routeCoords.length < 2) {
      throw new Error('Route must have at least 2 points');
    }

    // 2. Initialize result object
    const result = initializeResult();

    // 3. Analyze each route segment (with subdivision for accuracy)
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const segStart = routeCoords[i];
      const segEnd = routeCoords[i + 1];

      // Subdivide long segments to catch coverage gaps in the middle
      const subSegments = subdivideSegment(segStart, segEnd, 25);

      // Analyze each sub-segment independently
      for (const [subStart, subEnd] of subSegments) {
        const segDistance = calculateSegmentDistance(subStart, subEnd);

        // Update total distance
        result.totalDistance += segDistance;

        // Find nearest lane within threshold
        const nearestLane = findNearestLane(subStart, subEnd, lanes, threshold);

        // Update coverage statistics
        if (nearestLane) {
          updateCoverageForLane(result, nearestLane, segDistance);
        } else {
          updateNoCoverage(result, segDistance);
        }

        // Add to segments array (only add if it's a significant segment)
        result.segments.push({
          startPoint: subStart,
          endPoint: subEnd,
          distance: segDistance,
          laneId: nearestLane?.id || null,
          safetyRating: nearestLane?.safetyRating || null,
          laneName: nearestLane?.name || null
        });
      }
    }

    // 4. Calculate final percentages and summary
    result.totalDistanceKm = result.totalDistance / 1000;
    result.totalDistanceMiles = result.totalDistance / 1609.34;

    calculatePercentages(result);
    calculateSummary(result);

    return result;

  } catch (error) {
    console.error('Route analysis error:', error);
    return {
      error: error.message,
      totalDistance: 0,
      totalDistanceKm: 0,
      totalDistanceMiles: 0,
      coverage: {
        rating3: { distance: 0, percentage: 0, lanes: [] },
        rating2: { distance: 0, percentage: 0, lanes: [] },
        rating1: { distance: 0, percentage: 0, lanes: [] },
        noLane: { distance: 0, percentage: 100 }
      },
      summary: {
        totalCoveredDistance: 0,
        totalCoveredPercentage: 0,
        averageSafetyRating: 0,
        safestRoutePercentage: 0
      },
      segments: []
    };
  }
}
