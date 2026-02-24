// ── Centralized API Configuration ──

export const API_KEYS = {
    WEATHER: '0ee27c26068240ccb95120118261402',
    NASA: 'DnQbzNA77XSJGYG6haQ0zRbTZDb9VQjsVNEODf3B',
    ASTRONOMY_APP_ID: '05dc5bce-73ce-431e-b5fa-a57d4101ba59',
    ASTRONOMY_SECRET:
        '7758988adef9b8faebfbf47cb7f9f9523fbe62354233a3d191222137f1efa61edffd81859b26858f1bda2b2523d51a8f9ec88772d31c73d3164aa9c46c3eb3134ddff3dcd01c4f4e76923e3b962d56c1095f43cf82beaa0404fc6080884f5e14f4d7ca14efae7ebfa5176766318893b2',
} as const

export const BASE_URLS = {
    WEATHER: 'https://api.weatherapi.com/v1',
    ISS: 'http://api.open-notify.org',
    NASA: 'https://api.nasa.gov',
    NOAA: '/proxy-noaa',
    ASTRONOMY: '/proxy-astronomy/api/v2',
} as const

/** Generic JSON fetcher with timeout */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const res = await fetch(url, { ...options, signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return (await res.json()) as T
    } finally {
        clearTimeout(timeout)
    }
}

/** Basic auth header for AstronomyAPI */
export function astronomyAuthHeader(): string {
    return 'Basic ' + btoa(`${API_KEYS.ASTRONOMY_APP_ID}:${API_KEYS.ASTRONOMY_SECRET}`)
}

/** Default user location fallback (Mumbai) */
export const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777, city: 'Mumbai, India' }
