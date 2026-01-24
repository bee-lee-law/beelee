/**
 * Collision marker utilities for map visualization
 * Provides icon generation and styling for traffic collision markers
 */

import L from 'leaflet';

/**
 * Color scheme for collision severity
 * @param {number} injuryRating - Injury rating (0-3)
 * @returns {string} Hex color code
 */
function getCollisionColor(injuryRating) {
  switch(injuryRating) {
    case 3: return '#dc2626'; // Red - Serious injury
    case 2: return '#f97316'; // Orange - Minor injury
    case 1: return '#fbbf24'; // Yellow - Possible injury
    case 0: return '#a3a3a3'; // Gray - No injury
    default: return '#737373';
  }
}

/**
 * Create SVG icon for collision marker
 * Triangle warning icon with size based on severity
 * @param {Object} collision - Collision object with injuryRating
 * @returns {L.DivIcon} Leaflet div icon
 */
function createCollisionIcon(collision) {
  const color = getCollisionColor(collision.injuryRating);
  const size = 10 + (collision.injuryRating * 4);  // 10px to 22px

  // Warning triangle SVG
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 20h20L12 2z" fill="${color}" stroke="#000" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">!</text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'collision-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

/**
 * Get opacity based on distance from route
 * Fades markers that are further from the route
 * @param {number} distance - Distance in meters
 * @returns {number} Opacity value (0-1)
 */
export function getCollisionOpacity(distance) {
  if (distance <= 25) return 1.0;
  if (distance <= 50) return 0.8;
  if (distance <= 75) return 0.6;
  return 0.4;
}

export { createCollisionIcon, getCollisionColor };
