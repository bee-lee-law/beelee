import L from 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Blue marker SVG for origin
const blueMarkerSVG = `data:image/svg+xml;base64,${btoa(`
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#2563eb"/>
  <circle cx="12.5" cy="12.5" r="4" fill="white"/>
</svg>
`)}`;

// Red marker SVG for destination
const redMarkerSVG = `data:image/svg+xml;base64,${btoa(`
<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.5 12.5 28.5S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="#dc2626"/>
  <circle cx="12.5" cy="12.5" r="4" fill="white"/>
</svg>
`)}`;

// Origin marker icon (blue)
export const originIcon = L.icon({
  iconUrl: blueMarkerSVG,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Destination marker icon (red)
export const destIcon = L.icon({
  iconUrl: redMarkerSVG,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
