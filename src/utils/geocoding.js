/**
 * Geocoding utility using Nominatim (OpenStreetMap's free geocoder)
 *
 * Nominatim Usage Policy:
 * - Max 1 request per second
 * - Must include User-Agent header
 * - Free tier, no API key needed
 */

export async function geocodeLocation(query) {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '5',
    // Bias results to Grand Rapids, MI area
    countrycodes: 'us',
    // Bounding box for Grand Rapids area (southwest to northeast corners)
    viewbox: '-85.8,42.8,-85.5,43.1',
    bounded: '1', // Strictly limit results to viewbox
  });

  const url = `https://nominatim.openstreetmap.org/search?${params}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'BeeLeeMapsApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data');
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}
