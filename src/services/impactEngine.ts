import type { CurrentWeather, ForecastDay } from './weatherApi'
import type { KpIndexData } from './noaaApi'

// ── Types ──

export interface ImpactChain {
    type: string
    icon: string
    cause: string
    atmosphericEffect: string
    earthImpact: string
    humanRelevance: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
}

export interface ImpactAnalysis {
    climateImpact: ImpactChain
    agricultureImpact: ImpactChain
    disasterImpact: ImpactChain
    solarImpact: ImpactChain
}

// ── Engine ──

export function analyzeImpacts(
    weather: CurrentWeather | null,
    forecast: ForecastDay[],
    kpIndex: KpIndexData | null
): ImpactAnalysis {
    return {
        climateImpact: analyzeClimate(weather, forecast),
        agricultureImpact: analyzeAgriculture(weather, forecast),
        disasterImpact: analyzeDisaster(weather, forecast),
        solarImpact: analyzeSolar(kpIndex),
    }
}

// ── Climate Monitoring ──

function analyzeClimate(weather: CurrentWeather | null, forecast: ForecastDay[]): ImpactChain {
    const temp = weather?.temp_c ?? 25
    const uv = weather?.uv ?? 3
    const cloud = weather?.cloud ?? 50

    if (temp > 38 && uv > 8) {
        return {
            type: 'Climate Monitoring',
            icon: '🌡️',
            cause: 'Satellite-detected atmospheric warming trend',
            atmosphericEffect: 'Elevated regional temperature and UV radiation levels',
            earthImpact: 'Increased evaporation, heat stress on ecosystems',
            humanRelevance: 'Potential strain on water supply and agricultural productivity. UV risk for outdoor workers.',
            severity: 'high',
        }
    }

    if (temp > 32 || uv > 6) {
        return {
            type: 'Climate Monitoring',
            icon: '🌡️',
            cause: 'Above-average temperature and UV index detected via satellite monitoring',
            atmosphericEffect: 'Rising regional temperature levels',
            earthImpact: 'Increased evaporation and moderate heat stress',
            humanRelevance: 'Stay hydrated. Limit prolonged sun exposure during peak hours.',
            severity: 'moderate',
        }
    }

    const avgTemp = forecast.length > 0
        ? forecast.reduce((s, d) => s + d.day.maxtemp_c, 0) / forecast.length
        : temp

    return {
        type: 'Climate Monitoring',
        icon: '🌡️',
        cause: 'Satellite weather monitoring — normal conditions',
        atmosphericEffect: `Temperature trending at ${avgTemp.toFixed(1)}°C with ${cloud}% cloud cover`,
        earthImpact: 'Stable atmospheric conditions observed',
        humanRelevance: 'No climate-related concerns at this time. Conditions within seasonal norms.',
        severity: 'low',
    }
}

// ── Agriculture Impact ──

function analyzeAgriculture(weather: CurrentWeather | null, forecast: ForecastDay[]): ImpactChain {
    const totalRain = forecast.reduce((s, d) => s + (d.day.totalprecip_mm || 0), 0)
    const avgRainChance = forecast.length > 0
        ? forecast.reduce((s, d) => s + d.day.daily_chance_of_rain, 0) / forecast.length
        : 0

    if (totalRain > 50) {
        return {
            type: 'Agriculture Impact',
            icon: '🌾',
            cause: 'Satellite-based precipitation monitoring — excess rainfall detected',
            atmosphericEffect: `${totalRain.toFixed(1)}mm total precipitation predicted over 3 days`,
            earthImpact: 'Soil moisture saturation risk, potential waterlogging',
            humanRelevance: 'Crop yield risk from excess water. Irrigation and drainage planning adjustments required.',
            severity: 'high',
        }
    }

    if (totalRain < 2 && (weather?.humidity ?? 50) < 30) {
        return {
            type: 'Agriculture Impact',
            icon: '🌾',
            cause: 'Satellite monitoring — drought conditions emerging',
            atmosphericEffect: `Minimal rainfall predicted (${totalRain.toFixed(1)}mm), low humidity at ${weather?.humidity}%`,
            earthImpact: 'Soil moisture deficit, dry conditions',
            humanRelevance: 'Irrigation planning critical. Crop stress likely without intervention.',
            severity: 'moderate',
        }
    }

    return {
        type: 'Agriculture Impact',
        icon: '🌾',
        cause: 'Satellite precipitation monitoring — normal levels',
        atmosphericEffect: `${totalRain.toFixed(1)}mm precipitation forecast with ${avgRainChance.toFixed(0)}% rain chance`,
        earthImpact: 'Balanced soil moisture expected',
        humanRelevance: 'Favorable agricultural conditions. No irrigation adjustments needed.',
        severity: 'low',
    }
}

// ── Disaster Awareness ──

function analyzeDisaster(weather: CurrentWeather | null, forecast: ForecastDay[]): ImpactChain {
    const maxRain = Math.max(...forecast.map((d) => d.day.totalprecip_mm || 0), 0)
    const maxWind = Math.max(weather?.wind_kph ?? 0, ...forecast.map((d) => d.day.maxwind_kph || 0))
    const maxTemp = Math.max(weather?.temp_c ?? 0, ...forecast.map((d) => d.day.maxtemp_c || 0))

    // Flood risk
    if (maxRain > 40) {
        return {
            type: 'Disaster Awareness',
            icon: '🌊',
            cause: 'Satellite weather system monitoring — heavy precipitation system detected',
            atmosphericEffect: `Intense rainfall up to ${maxRain.toFixed(0)}mm predicted`,
            earthImpact: 'Urban flooding risk, river level rise',
            humanRelevance: 'Transportation disruption likely. Avoid low-lying areas. Monitor local emergency channels.',
            severity: maxRain > 80 ? 'critical' : 'high',
        }
    }

    // Storm risk
    if (maxWind > 60) {
        return {
            type: 'Disaster Awareness',
            icon: '🌀',
            cause: 'Satellite weather monitoring — high wind system approaching',
            atmosphericEffect: `Wind gusts up to ${Math.round(maxWind)} km/h expected`,
            earthImpact: 'Structural damage risk, power outage potential',
            humanRelevance: 'Secure outdoor items. Avoid travel during peak winds. Monitor weather advisories.',
            severity: maxWind > 90 ? 'critical' : 'high',
        }
    }

    // Extreme heat
    if (maxTemp > 45) {
        return {
            type: 'Disaster Awareness',
            icon: '🔥',
            cause: 'Satellite thermal monitoring — extreme heat event',
            atmosphericEffect: `Temperatures reaching ${maxTemp.toFixed(0)}°C`,
            earthImpact: 'Heat stress on infrastructure and ecosystems',
            humanRelevance: 'Public safety concern. Limit outdoor activity. Check on vulnerable neighbors.',
            severity: 'critical',
        }
    }

    return {
        type: 'Disaster Awareness',
        icon: '✅',
        cause: 'Satellite weather system monitoring — stable conditions',
        atmosphericEffect: 'No extreme weather patterns detected',
        earthImpact: 'Low risk environment',
        humanRelevance: 'No disaster-level threats detected. Standard safety precautions apply.',
        severity: 'low',
    }
}

// ── Solar Activity Impact ──

function analyzeSolar(kpIndex: KpIndexData | null): ImpactChain {
    const kp = kpIndex?.kpValue ?? 0

    if (kp >= 7) {
        return {
            type: 'Solar Impact',
            icon: '☀️',
            cause: 'Elevated solar flare activity — geomagnetic storm in progress',
            atmosphericEffect: 'Severe geomagnetic disturbance',
            earthImpact: 'Magnetosphere fluctuation, ionospheric disruption',
            humanRelevance: 'GPS accuracy degraded. HF radio communication disruption. Possible power grid instability.',
            severity: 'critical',
        }
    }

    if (kp >= 5) {
        return {
            type: 'Solar Impact',
            icon: '☀️',
            cause: 'Moderate solar activity — geomagnetic storming detected',
            atmosphericEffect: 'Moderate geomagnetic disturbance',
            earthImpact: 'Magnetosphere fluctuation',
            humanRelevance: 'Possible GPS and communication instability. Aurora visible at high latitudes.',
            severity: 'moderate',
        }
    }

    if (kp >= 3) {
        return {
            type: 'Solar Impact',
            icon: '☀️',
            cause: 'Unsettled solar conditions — minor geomagnetic activity',
            atmosphericEffect: 'Minor geomagnetic fluctuations',
            earthImpact: 'Slight magnetosphere perturbation',
            humanRelevance: 'No significant impact expected. Minor HF radio propagation effects possible.',
            severity: 'low',
        }
    }

    return {
        type: 'Solar Impact',
        icon: '☀️',
        cause: 'Quiet solar conditions — no significant solar events',
        atmosphericEffect: 'Stable geomagnetic field',
        earthImpact: 'Normal magnetosphere conditions',
        humanRelevance: 'All communication and navigation systems operating normally.',
        severity: 'low',
    }
}
