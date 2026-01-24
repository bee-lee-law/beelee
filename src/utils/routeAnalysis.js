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
    (result.coverage.rating3.distance * 1) +
    (result.coverage.rating2.distance * .8) +
    (result.coverage.rating1.distance * .5);

  result.summary.averageSafetyRating = totalCovered > 0
    ? weightedSum / result.totalDistance
    : 0;

  result.summary.safestRoutePercentage = result.coverage.rating3.percentage;
}

/**
 * Calculate distance from each collision to nearest route segment
 * @param {Array} collisions - Array of collision objects
 * @param {Array} routeCoords - Array of [lat, lng] route points
 * @returns {Array} Collisions with distance field filled in
 */
function calculateCollisionDistances(collisions, routeCoords) {
  if (!collisions || collisions.length === 0) return [];

  return collisions.map(collision => {
    const collisionPoint = [collision.location.lat, collision.location.lng];
    let minDistance = Infinity;
    let nearestSegmentIndex = -1;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const segStart = routeCoords[i];
      const segEnd = routeCoords[i + 1];

      const distance = segmentToSegmentDistance(
        collisionPoint,
        collisionPoint,
        segStart,
        segEnd
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestSegmentIndex = i;
      }
    }

    return {
      ...collision,
      distance: minDistance,
      nearestSegmentIndex
    };
  });
}

/**
 * Calculate safety impact of a single collision
 * Uses exponential decay based on distance from route
 * @param {Object} collision - Collision object
 * @param {number} distance - Distance from route in meters
 * @returns {number} Impact value (0-1)
 */
function calculateCollisionImpact(collision, distance) {
  if (distance > 100) return 0;

  const baseImpact = collision.safetyRating / 10;
  const severityMultiplier = 1 + (collision.injuryRating * 0.3);
  const distanceDecay = Math.exp(-distance / 30);

  return baseImpact * severityMultiplier * distanceDecay;
}

/**
 * Analyze collision data for route
 * @param {Array} collisions - Array of collisions with distances
 * @param {number} routeDistance - Total route distance in meters
 * @returns {Object} Collision analysis results
 */
function analyzeCollisions(collisions, routeDistance) {
  const collisionWeight = 0.3;
  const nearRoute = collisions.filter(c => c.distance <= 100);

  const statistics = {
    within50m: collisions.filter(c => c.distance <= 50).length,
    within100m: nearRoute.length,
    averageDistance: nearRoute.length > 0
      ? nearRoute.reduce((sum, c) => sum + c.distance, 0) / nearRoute.length
      : 0,

    bySeverity: {
      noInjury: nearRoute.filter(c => c.injuryRating === 0).length,
      possibleInjury: nearRoute.filter(c => c.injuryRating === 1).length,
      minorInjury: nearRoute.filter(c => c.injuryRating === 2).length,
      seriousInjury: nearRoute.filter(c => c.injuryRating === 3).length
    },

    byType: nearRoute.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {}),

    riskFactors: {
      bicycleInvolved: nearRoute.filter(c => c.bicycleInvolved).length,
      alcoholInvolved: nearRoute.filter(c => c.alcoholInvolved).length,
      phoneInvolved: nearRoute.filter(c => c.phoneInvolved).length,
      aggressiveDriver: nearRoute.filter(c => c.aggressiveDriverInvolved).length
    }
  };

  // Calculate collision impact with distances
  const collisionsWithImpact = nearRoute.map(c => ({
    ...c,
    impact: calculateCollisionImpact(c, c.distance)
  }));

  const totalImpact = collisionsWithImpact.reduce((sum, c) => sum + c.impact, 0);
  const impactPerKm = routeDistance > 0 ? totalImpact / (routeDistance / 1000) : 0;
  const normalizedCollisionSafety = Math.max(0, 1 - (impactPerKm / 5));

  return {
    total: collisions.length,
    nearRoute: collisionsWithImpact,
    statistics,
    impact: {
      totalImpact,
      impactPerKm,
      normalizedSafety: normalizedCollisionSafety*collisionWeight,
      safetyPenalty: (normalizedCollisionSafety - 1)*collisionWeight
    }
  };
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
 * @param {Object} collisionData - Traffic collision data from getCollisions()
 * @param {number} threshold - Distance threshold in meters (default: 15)
 * @returns {Object} Coverage analysis results
 */
export function analyzeRouteCoverage(routeData, laneData, collisionData = null, threshold = 15) {
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

    // Calculate collision distances if collision data provided
    const collisionsWithDistance = collisionData?.data?.collisions
      ? calculateCollisionDistances(collisionData.data.collisions, routeCoords)
      : [];

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

    // 5. Analyze collisions and adjust safety rating
    if (collisionsWithDistance.length > 0) {
      const collisionAnalysis = analyzeCollisions(
        collisionsWithDistance,
        result.totalDistance
      );

      // Adjust safety rating with collision data (70% lanes, 30% collisions)
      const laneWeight = 0.7;
      const collisionWeight = 0.3;
      const normalizedLaneRating = result.summary.averageSafetyRating / 3;
      /*
      result.summary.collisionAdjustedRating = (
        (normalizedLaneRating * laneWeight) +
        (collisionAnalysis.impact.normalizedSafety * collisionWeight)
      ) * 3;
      */
     result.summary.collisionAdjustedRating = result.summary.averageSafetyRating + (collisionAnalysis.impact.safetyPenalty)*collisionWeight;
      // Add collision data to result
      result.collisions = collisionAnalysis;
    } else {
      // No collision data available
      result.collisions = {
        total: 0,
        nearRoute: [],
        statistics: {
          within50m: 0,
          within100m: 0,
          averageDistance: 0,
          bySeverity: {
            noInjury: 0,
            possibleInjury: 0,
            minorInjury: 0,
            seriousInjury: 0
          },
          byType: {},
          riskFactors: {
            bicycleInvolved: 0,
            alcoholInvolved: 0,
            phoneInvolved: 0,
            aggressiveDriver: 0
          }
        },
        impact: {
          totalImpact: 0,
          impactPerKm: 0,
          normalizedSafety: 1,
          safetyPenalty: 0
        }
      };
    }

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
      segments: [],
      collisions: {
        total: 0,
        nearRoute: [],
        statistics: {
          within50m: 0,
          within100m: 0,
          averageDistance: 0,
          bySeverity: {
            noInjury: 0,
            possibleInjury: 0,
            minorInjury: 0,
            seriousInjury: 0
          },
          byType: {},
          riskFactors: {
            bicycleInvolved: 0,
            alcoholInvolved: 0,
            phoneInvolved: 0,
            aggressiveDriver: 0
          }
        },
        impact: {
          totalImpact: 0,
          impactPerKm: 0,
          normalizedSafety: 0,
          safetyPenalty: 0
        }
      }
    };
  }
}
