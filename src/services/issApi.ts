import { BASE_URLS, fetchJson } from './api'

// ── Types ──

export interface ISSPosition {
    latitude: number
    longitude: number
}

export interface Astronaut {
    name: string
    craft: string
}

// ── API Calls ──

/** Get current ISS position */
export async function getISSPosition(): Promise<ISSPosition> {
    const data = await fetchJson<any>(`${BASE_URLS.ISS}/iss-now.json`)
    return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
    }
}

/** Get people currently in space */
export async function getAstronauts(): Promise<{
    count: number
    people: Astronaut[]
}> {
    const data = await fetchJson<any>(`${BASE_URLS.ISS}/astros.json`)
    return {
        count: data.number,
        people: data.people,
    }
}

/** Reverse-geocode ISS coords to a readable region name */
export async function getISSRegion(lat: number, lng: number): Promise<string> {
    try {
        const data = await fetchJson<any>(
            `/proxy-nominatim/reverse?lat=${lat}&lon=${lng}&format=json&zoom=3`,
            { headers: { 'User-Agent': 'AstroView/1.0' } }
        )
        return data.display_name || determineOceanRegion(lat, lng)
    } catch {
        return determineOceanRegion(lat, lng)
    }
}

/** Fallback: estimate ocean/continent from coordinates */
function determineOceanRegion(lat: number, lng: number): string {
    if (lat > 60) return 'Arctic Region'
    if (lat < -60) return 'Antarctic Region'

    if (lng > -30 && lng < 60) {
        if (lat > 35) return 'Europe'
        if (lat > 0) return 'North Africa'
        return 'Sub-Saharan Africa'
    }
    if (lng >= 60 && lng < 150) {
        if (lat > 0) return 'Asia'
        return 'Indian Ocean'
    }
    if (lng >= -170 && lng < -30) {
        if (lat > 15) return 'North America'
        if (lat > -15) return 'Central America / Caribbean'
        return 'South America'
    }
    if (lng >= 150 || lng < -170) {
        if (lat > -10) return 'Western Pacific'
        return 'Oceania / Australia'
    }
    return 'Open Ocean'
}
