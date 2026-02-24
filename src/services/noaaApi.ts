import { BASE_URLS, fetchJson } from './api'

// ── Types ──

export interface KpIndexData {
    kpValue: number
    timeTag: string
    kpLevel: 'Quiet' | 'Unsettled' | 'Active' | 'Storm' | 'Severe Storm'
}

export interface SolarFlareData {
    hasRecentFlare: boolean
    maxClass: string
    flareCount: number
    level: 'Normal' | 'Elevated' | 'High'
}

export interface GeomagneticData {
    stormLevel: 'None' | 'Minor' | 'Moderate' | 'Strong' | 'Severe' | 'Extreme'
    kpValue: number
    auroraChance: number  // 0–100
}

// ── API Calls ──

const base = BASE_URLS.NOAA

/** Get latest planetary Kp index */
export async function getKpIndex(): Promise<KpIndexData> {
    const data = await fetchJson<any[]>(`${base}/products/noaa-planetary-k-index.json`)

    // Data is an array; first row is headers, last row is most recent
    const latest = data[data.length - 1]
    const kp = parseFloat(latest[1]) // Kp value is in index 1

    return {
        kpValue: kp,
        timeTag: latest[0],
        kpLevel: getKpLevel(kp),
    }
}

/** Get solar flare activity from recent X-ray events */
export async function getSolarFlareActivity(): Promise<SolarFlareData> {
    try {
        const data = await fetchJson<any[]>(
            `${base}/products/solar-event-probabilities.json`
        )

        // First row is headers, rest is data
        if (data.length <= 1) {
            return { hasRecentFlare: false, maxClass: 'None', flareCount: 0, level: 'Normal' }
        }

        const latest = data[1] // Most recent forecast
        const cFlareProb = parseInt(latest[1] || '0')
        const mFlareProb = parseInt(latest[2] || '0')
        const xFlareProb = parseInt(latest[3] || '0')

        const level: SolarFlareData['level'] =
            xFlareProb > 10 ? 'High' : mFlareProb > 30 ? 'Elevated' : 'Normal'

        const maxClass = xFlareProb > 10 ? 'X-class' : mFlareProb > 30 ? 'M-class' : cFlareProb > 50 ? 'C-class' : 'None'

        return {
            hasRecentFlare: level !== 'Normal',
            maxClass,
            flareCount: cFlareProb + mFlareProb + xFlareProb,
            level,
        }
    } catch {
        return { hasRecentFlare: false, maxClass: 'None', flareCount: 0, level: 'Normal' }
    }
}

/** Get geomagnetic storm and aurora data */
export async function getGeomagneticStorm(): Promise<GeomagneticData> {
    const kpData = await getKpIndex()
    const kp = kpData.kpValue

    const stormLevel: GeomagneticData['stormLevel'] =
        kp >= 9 ? 'Extreme' :
            kp >= 8 ? 'Severe' :
                kp >= 7 ? 'Strong' :
                    kp >= 6 ? 'Moderate' :
                        kp >= 5 ? 'Minor' : 'None'

    // Aurora chance approximation based on Kp
    const auroraChance = Math.min(100, Math.round(kp * 12))

    return { stormLevel, kpValue: kp, auroraChance }
}

// ── Helpers ──

function getKpLevel(kp: number): KpIndexData['kpLevel'] {
    if (kp >= 7) return 'Severe Storm'
    if (kp >= 5) return 'Storm'
    if (kp >= 4) return 'Active'
    if (kp >= 3) return 'Unsettled'
    return 'Quiet'
}
