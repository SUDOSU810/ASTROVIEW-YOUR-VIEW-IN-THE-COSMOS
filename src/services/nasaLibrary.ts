import { fetchJson } from './api'

// ── Types ──

export interface NasaLibraryItem {
    title: string
    imageUrl: string
    description: string
    dateCreated: string
    center: string
    whyItMatters: string
}

// ── Topic → "Why it matters" mapping ──

const WHY_IT_MATTERS: Record<string, string> = {
    'solar flare':
        'Solar flares can disrupt satellite communications, GPS systems, and power grids. Understanding solar activity helps protect critical infrastructure.',
    'asteroid':
        'Tracking near-Earth asteroids is crucial for planetary defense. Even small asteroids can release energy equivalent to nuclear weapons on impact.',
    'moon':
        'The Moon influences Earth\'s tides, stabilizes our axial tilt, and affects biological rhythms. Lunar studies also prepare us for future human settlements.',
    'iss':
        'The International Space Station is humanity\'s only permanent presence in space. It enables research in microgravity that benefits medicine, materials science, and climate monitoring.',
    'mars rover':
        'Mars rovers search for signs of ancient life and test technologies for future human missions. Understanding Mars helps us understand Earth\'s own climate history.',
    'aurora':
        'Auroras are caused by solar wind interacting with Earth\'s magnetosphere. They indicate geomagnetic activity that can affect electronics and communications.',
    'nebula':
        'Nebulae are stellar nurseries where new stars and planets form. Studying them helps us understand the origins of our own solar system.',
    'earth':
        'Satellite Earth observation enables weather forecasting, disaster monitoring, deforestation tracking, and climate change research.',
    'sun':
        'The Sun drives all weather on Earth and its activity cycles affect everything from agriculture to communication systems.',
    'jupiter':
        'Jupiter\'s massive gravity shields Earth from many asteroid impacts. Its moons, especially Europa, may harbor conditions for life.',
}

// ── API Calls ──

/** Search NASA Image & Video Library */
export async function searchNasaImages(topic: string): Promise<NasaLibraryItem[]> {
    const data = await fetchJson<any>(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(topic)}&media_type=image&page_size=6`
    )

    const items: any[] = data?.collection?.items || []

    return items
        .filter((item: any) => item.links?.[0]?.href && item.data?.[0])
        .slice(0, 6)
        .map((item: any) => {
            const meta = item.data[0]
            const desc = meta.description || ''

            return {
                title: meta.title || 'Untitled',
                imageUrl: item.links[0].href,
                description: desc.length > 300 ? desc.slice(0, 300) + '...' : desc,
                dateCreated: meta.date_created?.split('T')[0] || 'Unknown',
                center: meta.center || 'NASA',
                whyItMatters: getWhyItMatters(topic),
            }
        })
}

/** Get "Why it matters" text for a topic */
function getWhyItMatters(topic: string): string {
    const lower = topic.toLowerCase()
    for (const [key, value] of Object.entries(WHY_IT_MATTERS)) {
        if (lower.includes(key) || key.includes(lower)) return value
    }
    return 'Space research expands our understanding of the universe and drives technological innovation that benefits life on Earth.'
}
