import { BASE_URLS, fetchJson, astronomyAuthHeader } from './api'

// ── Types ──

export interface PlanetData {
    name: string
    rise: string
    set: string
    altitude: number
    isVisible: boolean
}

export interface MoonPhaseData {
    phase: string
    illumination: number
    age: number
}

// ── API Calls ──

const base = BASE_URLS.ASTRONOMY

/** Get planet positions for a given location */
export async function getPlanetPositions(
    lat: number,
    lng: number
): Promise<PlanetData[]> {
    try {
        const today = new Date().toISOString().split('T')[0]
        const bodies = ['mars', 'jupiter', 'saturn', 'venus', 'mercury']

        const data = await fetchJson<any>(`${base}/bodies/positions`, {
            method: 'POST',
            headers: {
                Authorization: astronomyAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                elevation: 0,
                from_date: today,
                to_date: today,
                time: '20:00:00',
            }),
        })

        // The API returns rows with body data
        const rows: any[] = data?.data?.table?.rows || []

        return rows
            .filter((row: any) => bodies.includes(row.entry?.id?.toLowerCase()))
            .map((row: any) => {
                const cells = row.cells?.[0] || {}
                const alt = parseFloat(cells?.position?.horizontal?.altitude?.degrees || '0')

                return {
                    name: row.entry?.name || 'Unknown',
                    rise: cells?.extraInfo?.rise?.text || 'N/A',
                    set: cells?.extraInfo?.set?.text || 'N/A',
                    altitude: alt,
                    isVisible: alt > 0,
                }
            })
    } catch {
        return []
    }
}

/** Get detailed moon phase from AstronomyAPI */
export async function getMoonPhase(
    lat: number,
    lng: number
): Promise<MoonPhaseData | null> {
    try {
        const today = new Date().toISOString().split('T')[0]
        const data = await fetchJson<any>(`${base}/bodies/positions/moon`, {
            method: 'POST',
            headers: {
                Authorization: astronomyAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                elevation: 0,
                from_date: today,
                to_date: today,
                time: '20:00:00',
            }),
        })

        const moonData = data?.data?.table?.rows?.[0]?.cells?.[0]
        if (!moonData) return null

        return {
            phase: moonData.extraInfo?.phase?.string || 'Unknown',
            illumination: parseFloat(moonData.extraInfo?.phase?.fraction || '0') * 100,
            age: parseFloat(moonData.extraInfo?.phase?.age || '0'),
        }
    } catch {
        return null
    }
}
