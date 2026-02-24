import { API_KEYS, fetchJson } from './api'

// ── Types ──

export interface EpicImage {
    identifier: string
    caption: string
    date: string
    imageUrl: string
    coords: {
        lat: number
        lng: number
    }
}

// ── API Calls ──

/** Get latest Earth satellite imagery from NASA EPIC */
export async function getLatestEarthImage(): Promise<EpicImage | null> {
    try {
        const data = await fetchJson<any[]>(
            `https://api.nasa.gov/EPIC/api/natural?api_key=${API_KEYS.NASA}`
        )

        if (!data || data.length === 0) return null

        const latest = data[0]
        const date = latest.date.split(' ')[0] // "2024-01-15"
        const [year, month, day] = date.split('-')

        // EPIC image URL format
        const imageUrl = `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${latest.image}.png?api_key=${API_KEYS.NASA}`

        return {
            identifier: latest.identifier,
            caption: latest.caption || 'Earth as seen from the DSCOVR satellite',
            date: latest.date,
            imageUrl,
            coords: {
                lat: latest.centroid_coordinates?.lat || 0,
                lng: latest.centroid_coordinates?.lon || 0,
            },
        }
    } catch {
        return null
    }
}

/** Get multiple recent Earth images */
export async function getRecentEarthImages(count: number = 3): Promise<EpicImage[]> {
    try {
        const data = await fetchJson<any[]>(
            `https://api.nasa.gov/EPIC/api/natural?api_key=${API_KEYS.NASA}`
        )

        if (!data || data.length === 0) return []

        return data.slice(0, count).map((item) => {
            const date = item.date.split(' ')[0]
            const [year, month, day] = date.split('-')
            const imageUrl = `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${item.image}.png?api_key=${API_KEYS.NASA}`

            return {
                identifier: item.identifier,
                caption: item.caption || 'Earth observation',
                date: item.date,
                imageUrl,
                coords: {
                    lat: item.centroid_coordinates?.lat || 0,
                    lng: item.centroid_coordinates?.lon || 0,
                },
            }
        })
    } catch {
        return []
    }
}
