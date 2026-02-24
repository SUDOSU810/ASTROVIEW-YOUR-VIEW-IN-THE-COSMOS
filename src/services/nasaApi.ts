import { API_KEYS, BASE_URLS, fetchJson } from './api'

// ── Types ──

export interface APOD {
    title: string
    url: string
    hdurl?: string
    explanation: string
    media_type: 'image' | 'video'
    date: string
    copyright?: string
}

export interface NeoAsteroid {
    id: string
    name: string
    estimated_diameter_m: { min: number; max: number }
    is_potentially_hazardous: boolean
    close_approach_date: string
    miss_distance_km: number
    relative_velocity_kph: number
}

// ── API Calls ──

const base = BASE_URLS.NASA
const key = API_KEYS.NASA

/** Astronomy Picture of the Day */
export async function getAPOD(): Promise<APOD> {
    return fetchJson<APOD>(`${base}/planetary/apod?api_key=${key}`)
}

/** Near-Earth Asteroids for today */
export async function getNeoAsteroids(): Promise<{
    count: number
    hazardousCount: number
    asteroids: NeoAsteroid[]
}> {
    const today = new Date().toISOString().split('T')[0]
    const data = await fetchJson<any>(
        `${base}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${key}`
    )

    const allNeos: any[] = Object.values(data.near_earth_objects).flat()

    const asteroids: NeoAsteroid[] = allNeos.map((neo: any) => ({
        id: neo.id,
        name: neo.name.replace(/[()]/g, '').trim(),
        estimated_diameter_m: {
            min: Math.round(neo.estimated_diameter.meters.estimated_diameter_min),
            max: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
        },
        is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
        close_approach_date: neo.close_approach_data[0]?.close_approach_date_full || today,
        miss_distance_km: Math.round(parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers || '0')),
        relative_velocity_kph: Math.round(parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour || '0')),
    }))

    return {
        count: asteroids.length,
        hazardousCount: asteroids.filter((a) => a.is_potentially_hazardous).length,
        asteroids: asteroids.sort((a, b) => a.miss_distance_km - b.miss_distance_km),
    }
}
