import type { CurrentWeather, WeatherAstronomy, HourlyForecast } from './weatherApi'
import type { KpIndexData } from './noaaApi'

// ── Types ──

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertType = 'iss' | 'aurora' | 'flood' | 'heatwave' | 'storm' | 'solar'

export interface Alert {
    id: string
    type: AlertType
    severity: AlertSeverity
    icon: string
    title: string
    message: string
    timeframe: string
}

interface AlertInput {
    weather: CurrentWeather | null
    astronomy: WeatherAstronomy | null
    hourly: HourlyForecast[]
    kpIndex: KpIndexData | null
    lat: number
    lng: number
}

// ── Alert Generation Engine ──

export function generateAlerts(input: AlertInput): Alert[] {
    const alerts: Alert[] = []
    const { weather, astronomy, hourly, kpIndex, lat } = input

    // 1) ISS Visible Alert — if clear skies after sunset
    if (weather && astronomy) {
        const isAfterSunset = isCurrentlyAfterSunset(astronomy.sunset)
        const cloudCover = weather.cloud

        if (isAfterSunset && cloudCover < 30) {
            alerts.push({
                id: 'iss-visible',
                type: 'iss',
                severity: 'info',
                icon: '🛰️',
                title: 'ISS May Be Visible',
                message: `Clear skies (${cloudCover}% clouds) after sunset. Great conditions to spot the ISS overhead.`,
                timeframe: 'Tonight',
            })
        }
    }

    // 2) Aurora Alert — Kp > 5 and high latitude
    if (kpIndex && kpIndex.kpValue >= 5 && Math.abs(lat) > 55) {
        alerts.push({
            id: 'aurora',
            type: 'aurora',
            severity: kpIndex.kpValue >= 7 ? 'critical' : 'warning',
            icon: '🌌',
            title: 'Aurora Visibility Possible',
            message: `Kp Index at ${kpIndex.kpValue.toFixed(1)} with your latitude at ${Math.abs(lat).toFixed(1)}°. Aurora may be visible tonight.`,
            timeframe: 'Next 6–12 hours',
        })
    } else if (kpIndex && kpIndex.kpValue >= 7) {
        // Extremely high Kp — aurora visible even at lower latitudes
        alerts.push({
            id: 'aurora-extreme',
            type: 'aurora',
            severity: 'critical',
            icon: '🌌',
            title: 'Extreme Geomagnetic Storm',
            message: `Kp Index at ${kpIndex.kpValue.toFixed(1)}! Aurora may be visible at unusually low latitudes.`,
            timeframe: 'Now',
        })
    }

    // 3) Flood Risk Alert — rain chance > 70%
    const nextHoursRain = hourly.slice(0, 12).filter((h) => h.chance_of_rain > 70)
    if (nextHoursRain.length >= 3) {
        alerts.push({
            id: 'flood-risk',
            type: 'flood',
            severity: nextHoursRain.length >= 6 ? 'critical' : 'warning',
            icon: '🌊',
            title: 'Flood Risk Alert',
            message: `Heavy rainfall predicted for ${nextHoursRain.length} of the next 12 hours. Average rain chance: ${Math.round(nextHoursRain.reduce((s, h) => s + h.chance_of_rain, 0) / nextHoursRain.length)}%.`,
            timeframe: 'Next 12 hours',
        })
    }

    // 4) Heatwave Alert — temp > 40°C
    if (weather && weather.temp_c > 40) {
        alerts.push({
            id: 'heatwave',
            type: 'heatwave',
            severity: weather.temp_c > 45 ? 'critical' : 'warning',
            icon: '🌡️',
            title: 'Heatwave Alert',
            message: `Extreme temperature: ${weather.temp_c}°C (feels like ${weather.feelslike_c}°C). Stay hydrated and avoid sun exposure.`,
            timeframe: 'Active now',
        })
    } else if (weather && weather.temp_c > 35) {
        alerts.push({
            id: 'heat-advisory',
            type: 'heatwave',
            severity: 'info',
            icon: '🌡️',
            title: 'Heat Advisory',
            message: `High temperature: ${weather.temp_c}°C. Stay hydrated.`,
            timeframe: 'Active now',
        })
    }

    // 5) Storm Alert — wind > 60 km/h
    if (weather && weather.wind_kph > 60) {
        alerts.push({
            id: 'storm',
            type: 'storm',
            severity: weather.wind_kph > 90 ? 'critical' : 'warning',
            icon: '💨',
            title: 'Storm Warning',
            message: `Dangerous winds at ${Math.round(weather.wind_kph)} km/h from ${weather.wind_dir}. Secure outdoor items and stay indoors.`,
            timeframe: 'Active now',
        })
    }

    // 6) Solar storm alert — Kp > 5
    if (kpIndex && kpIndex.kpValue >= 5) {
        alerts.push({
            id: 'solar-storm',
            type: 'solar',
            severity: kpIndex.kpValue >= 7 ? 'critical' : 'warning',
            icon: '☀️',
            title: 'Geomagnetic Storm',
            message: `Kp Index at ${kpIndex.kpValue.toFixed(1)} (${kpIndex.kpLevel}). GPS and communication disruptions possible.`,
            timeframe: 'Active now',
        })
    }

    // Sort: critical first, then warning, then info
    const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return alerts
}

// ── Helpers ──

function isCurrentlyAfterSunset(sunsetStr: string): boolean {
    try {
        const now = new Date()
        const match = sunsetStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (!match) return now.getHours() >= 18 // fallback

        let hours = parseInt(match[1])
        const mins = parseInt(match[2])
        const period = match[3].toUpperCase()

        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0

        const sunsetMinutes = hours * 60 + mins
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        return currentMinutes >= sunsetMinutes
    } catch {
        return new Date().getHours() >= 18
    }
}
