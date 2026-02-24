import * as satellite from 'satellite.js'

// ── Types ──
export interface SatelliteInfo {
    name: string
    type: SatelliteType
    lat: number
    lng: number
    altitude: number // km
    speed: number // km/s
    noradId: string
}

export type SatelliteType =
    | 'space-station'
    | 'scientific'
    | 'communication'
    | 'navigation'
    | 'weather'
    | 'earth-observation'

interface TLERecord {
    name: string
    line1: string
    line2: string
    type: SatelliteType
}

// ── Curated Satellite List ──
// We fetch from CelesTrak's public GP (General Perturbations) API
// Using specific NORAD IDs for a curated set of interesting satellites

const CURATED_SATS: { noradId: string; name: string; type: SatelliteType }[] = [
    // Space Stations
    { noradId: '25544', name: 'ISS (ZARYA)', type: 'space-station' },
    { noradId: '48274', name: 'CSS (TIANHE)', type: 'space-station' },
    // Scientific
    { noradId: '20580', name: 'Hubble Space Telescope', type: 'scientific' },
    { noradId: '43013', name: 'NOAA-20 (JPSS-1)', type: 'weather' },
    { noradId: '29155', name: 'NOAA-18', type: 'weather' },
    // Earth Observation
    { noradId: '39084', name: 'Landsat 8', type: 'earth-observation' },
    { noradId: '49260', name: 'Landsat 9', type: 'earth-observation' },
    { noradId: '36508', name: 'SDO (Solar Dynamics)', type: 'scientific' },
    // Navigation (GPS)
    { noradId: '28874', name: 'GPS IIR-M 1', type: 'navigation' },
    { noradId: '32260', name: 'GPS IIR-M 5', type: 'navigation' },
    { noradId: '40534', name: 'GPS IIF-9', type: 'navigation' },
    { noradId: '41019', name: 'GPS IIF-11', type: 'navigation' },
    // Communication
    { noradId: '36411', name: 'GOES-15', type: 'communication' },
    { noradId: '41866', name: 'GOES-16', type: 'weather' },
    { noradId: '43226', name: 'GOES-17', type: 'weather' },
    // Starlink (sample)
    { noradId: '44713', name: 'STARLINK-1007', type: 'communication' },
    { noradId: '44714', name: 'STARLINK-1008', type: 'communication' },
    { noradId: '44715', name: 'STARLINK-1009', type: 'communication' },
    { noradId: '44716', name: 'STARLINK-1010', type: 'communication' },
    { noradId: '44717', name: 'STARLINK-1011', type: 'communication' },
    // Iridium
    { noradId: '42962', name: 'IRIDIUM 163', type: 'communication' },
    { noradId: '42803', name: 'IRIDIUM 148', type: 'communication' },
    // Weather
    { noradId: '33591', name: 'NOAA-19', type: 'weather' },
    { noradId: '43689', name: 'METOP-C', type: 'weather' },
]

// ── TLE Cache ──
let tleCache: TLERecord[] = []
let lastFetchTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

/**
 * Fetch TLE data from CelesTrak for our curated satellites.
 * Uses the GP API (JSON format) for individual NORAD IDs.
 */
export async function fetchTLEData(): Promise<TLERecord[]> {
    const now = Date.now()
    if (tleCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
        return tleCache
    }

    // Fetch active satellites TLE in 3LE format from CelesTrak
    // We'll use the "stations" and "active" groups for broader coverage
    const urls = [
        'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=3le',
        'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=3le',
    ]

    const allLines: string[] = []
    for (const url of urls) {
        try {
            const res = await fetch(url)
            if (res.ok) {
                const text = await res.text()
                allLines.push(...text.trim().split('\n'))
            }
        } catch {
            // Try next URL
        }
    }

    if (allLines.length === 0) {
        // Fallback: try individual satellite queries
        return fetchIndividualTLEs()
    }

    // Parse 3LE format: name\nline1\nline2
    const records: TLERecord[] = []
    const noradIdSet = new Set(CURATED_SATS.map((s) => s.noradId))

    for (let i = 0; i < allLines.length - 2; i++) {
        const line1 = allLines[i + 1]?.trim()
        const line2 = allLines[i + 2]?.trim()

        if (line1?.startsWith('1 ') && line2?.startsWith('2 ')) {
            // Extract NORAD ID from line 1 (columns 3-7)
            const noradId = line1.substring(2, 7).trim()

            if (noradIdSet.has(noradId)) {
                const meta = CURATED_SATS.find((s) => s.noradId === noradId)!
                records.push({
                    name: meta.name,
                    line1,
                    line2,
                    type: meta.type,
                })
                noradIdSet.delete(noradId) // Don't double-add
            }
            i += 2 // Skip lines we just consumed
        }
    }

    tleCache = records
    lastFetchTime = now
    return records
}

async function fetchIndividualTLEs(): Promise<TLERecord[]> {
    const records: TLERecord[] = []

    for (const sat of CURATED_SATS.slice(0, 10)) {
        // Limit to 10 to avoid rate-limiting
        try {
            const res = await fetch(
                `https://celestrak.org/NORAD/elements/gp.php?CATNR=${sat.noradId}&FORMAT=3le`
            )
            if (res.ok) {
                const text = await res.text()
                const lines = text.trim().split('\n')
                if (lines.length >= 3) {
                    records.push({
                        name: sat.name,
                        line1: lines[1].trim(),
                        line2: lines[2].trim(),
                        type: sat.type,
                    })
                }
            }
        } catch {
            // Skip this satellite
        }
    }

    tleCache = records
    lastFetchTime = Date.now()
    return records
}

/**
 * Propagate satellite positions from TLE records at a given time.
 */
export function propagatePositions(
    tleRecords: TLERecord[],
    date: Date = new Date()
): SatelliteInfo[] {
    const results: SatelliteInfo[] = []
    const gmst = satellite.gstime(date)

    for (const rec of tleRecords) {
        try {
            const satrec = satellite.twoline2satrec(rec.line1, rec.line2)
            const posVel = satellite.propagate(satrec, date)

            if (
                !posVel ||
                !posVel.position ||
                typeof posVel.position === 'boolean' ||
                !posVel.velocity ||
                typeof posVel.velocity === 'boolean'
            ) {
                continue
            }

            const posEci = posVel.position
            const velEci = posVel.velocity

            const geodetic = satellite.eciToGeodetic(posEci, gmst)
            const lat = satellite.degreesLat(geodetic.latitude)
            const lng = satellite.degreesLong(geodetic.longitude)
            const altitude = geodetic.height // km

            // Speed = magnitude of velocity vector (km/s)
            const speed = Math.sqrt(
                velEci.x * velEci.x + velEci.y * velEci.y + velEci.z * velEci.z
            )

            // Extract NORAD ID from line 1
            const noradId = rec.line1.substring(2, 7).trim()

            results.push({
                name: rec.name,
                type: rec.type,
                lat,
                lng,
                altitude,
                speed,
                noradId,
            })
        } catch {
            // Skip satellites with propagation errors
        }
    }

    return results
}

/**
 * Get the color for a satellite type.
 */
export function getSatelliteColor(type: SatelliteType): string {
    switch (type) {
        case 'space-station':
            return '#FF4C4C'
        case 'scientific':
            return '#00F5FF'
        case 'communication':
            return '#FFB800'
        case 'navigation':
            return '#00FF88'
        case 'weather':
            return '#7B61FF'
        case 'earth-observation':
            return '#FF6B9D'
        default:
            return '#FFFFFF'
    }
}
