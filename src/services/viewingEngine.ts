import type { HourlyForecast, WeatherAstronomy } from './weatherApi'

// ── Types ──

export interface ViewingWindow {
    bestStartTime: string
    bestEndTime: string
    qualityScore: number  // 0–100
    reason: string
    found: boolean
}

// ── Engine ──

/**
 * Scan next 6 hours of weather data to find the best stargazing window.
 * Criteria: cloud < 25%, no rain, moon illumination < 70%, after sunset.
 */
export function computeBestViewingWindow(
    hourly: HourlyForecast[],
    astronomy: WeatherAstronomy | null,
    moonIllumination: number
): ViewingWindow {
    if (!astronomy || hourly.length === 0) {
        return { bestStartTime: '', bestEndTime: '', qualityScore: 0, reason: 'Insufficient data', found: false }
    }

    const now = new Date()
    const sunsetTime = parseSunsetTime(astronomy.sunset)

    // Filter hours that are in the future and after sunset
    const eligibleHours = hourly.filter((h) => {
        const hourTime = new Date(h.time.replace(' ', 'T'))
        return hourTime > now && (hourTime >= sunsetTime || now >= sunsetTime)
    }).slice(0, 12) // Check next 12 eligible hours

    if (eligibleHours.length === 0) {
        return {
            bestStartTime: '',
            bestEndTime: '',
            qualityScore: 0,
            reason: 'No evening hours in forecast window',
            found: false,
        }
    }

    // Score each hour: lower cloud + higher visibility + no rain = better
    const scored = eligibleHours.map((h) => {
        const cloudScore = Math.max(0, 100 - h.cloud * 1.2) // Heavy penalty for clouds
        const rainScore = h.chance_of_rain > 30 ? 0 : 100 - h.chance_of_rain
        const visScore = Math.min(100, (h.vis_km / 10) * 100)
        const moonScore = moonIllumination < 30 ? 100 : moonIllumination < 70 ? 60 : 30
        const total = Math.round(cloudScore * 0.4 + rainScore * 0.25 + visScore * 0.2 + moonScore * 0.15)

        return { hour: h, score: total }
    })

    // Find best consecutive window (at least 1 hour)
    let bestStart = 0
    let bestLength = 1
    let bestAvgScore = scored[0]?.score || 0

    for (let i = 0; i < scored.length; i++) {
        if (scored[i].score < 40) continue // Skip bad hours

        let windowScore = 0
        let windowLen = 0

        for (let j = i; j < scored.length && j < i + 6; j++) {
            if (scored[j].score < 35) break
            windowScore += scored[j].score
            windowLen++
        }

        const avg = windowLen > 0 ? windowScore / windowLen : 0
        if (avg > bestAvgScore || (avg === bestAvgScore && windowLen > bestLength)) {
            bestStart = i
            bestLength = windowLen
            bestAvgScore = avg
        }
    }

    if (bestAvgScore < 30) {
        return {
            bestStartTime: '',
            bestEndTime: '',
            qualityScore: Math.round(bestAvgScore),
            reason: 'Poor conditions expected. High cloud cover or rain predicted.',
            found: false,
        }
    }

    const startHour = scored[bestStart].hour
    const endHour = scored[Math.min(bestStart + bestLength - 1, scored.length - 1)].hour

    const startTimeFmt = formatHourTime(startHour.time)
    const endTimeFmt = formatHourTime(endHour.time, true)

    // Build reason
    const avgCloud = Math.round(
        scored.slice(bestStart, bestStart + bestLength).reduce((s, h) => s + h.hour.cloud, 0) / bestLength
    )
    const reasons: string[] = []
    if (avgCloud < 15) reasons.push('Clear skies')
    else if (avgCloud < 30) reasons.push('Low cloud cover')
    else reasons.push('Acceptable cloud cover')
    if (moonIllumination < 30) reasons.push('minimal moon interference')
    else if (moonIllumination < 70) reasons.push('moderate moon brightness')
    reasons.push(`${bestLength}h window`)

    return {
        bestStartTime: startTimeFmt,
        bestEndTime: endTimeFmt,
        qualityScore: Math.round(bestAvgScore),
        reason: reasons.join(' · '),
        found: true,
    }
}

// ── Helpers ──

function parseSunsetTime(sunsetStr: string): Date {
    const now = new Date()
    const match = sunsetStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) {
        const d = new Date(now)
        d.setHours(18, 30, 0, 0)
        return d
    }
    let hours = parseInt(match[1])
    const mins = parseInt(match[2])
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const d = new Date(now)
    d.setHours(hours, mins, 0, 0)
    return d
}

function formatHourTime(timeStr: string, addHour: boolean = false): string {
    try {
        const d = new Date(timeStr.replace(' ', 'T'))
        if (addHour) d.setHours(d.getHours() + 1)
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    } catch {
        return timeStr
    }
}
