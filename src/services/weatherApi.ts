import { API_KEYS, BASE_URLS, fetchJson } from './api'

// ── Types ──

export interface CurrentWeather {
    temp_c: number
    humidity: number
    cloud: number
    vis_km: number
    wind_kph: number
    wind_dir: string
    condition: { text: string; icon: string }
    feelslike_c: number
    uv: number
    precip_mm: number
}

export interface WeatherAstronomy {
    sunrise: string
    sunset: string
    moonrise: string
    moonset: string
    moon_phase: string
    moon_illumination: number
}

export interface ForecastDay {
    date: string
    day: {
        maxtemp_c: number
        mintemp_c: number
        daily_chance_of_rain: number
        condition: { text: string; icon: string }
        avgvis_km: number
        maxwind_kph: number
        avghumidity: number
        uv: number
        totalprecip_mm: number
    }
    astro: WeatherAstronomy
}

export interface WeatherAlert {
    headline: string
    severity: string
    event: string
    desc: string
}

export interface HourlyForecast {
    time: string
    time_epoch: number
    temp_c: number
    cloud: number
    chance_of_rain: number
    wind_kph: number
    vis_km: number
    humidity: number
    condition: { text: string; icon: string }
    feelslike_c: number
    precip_mm: number
    uv: number
}

// ── API Calls ──

const base = BASE_URLS.WEATHER
const key = API_KEYS.WEATHER

/** Current weather conditions */
export async function getCurrentWeather(location: string): Promise<{
    current: CurrentWeather
    locationName: string
}> {
    const data = await fetchJson<any>(`${base}/current.json?key=${key}&q=${encodeURIComponent(location)}&aqi=no`)
    return {
        current: data.current,
        locationName: `${data.location.name}, ${data.location.country}`,
    }
}

/** Weather astronomy data (sunrise, sunset, moon) */
export async function getAstronomy(location: string): Promise<WeatherAstronomy> {
    const data = await fetchJson<any>(`${base}/astronomy.json?key=${key}&q=${encodeURIComponent(location)}`)
    return data.astronomy.astro
}

/** 3-day forecast + alerts + hourly data */
export async function getForecast(location: string): Promise<{
    days: ForecastDay[]
    alerts: WeatherAlert[]
    hourly: HourlyForecast[]
}> {
    const data = await fetchJson<any>(
        `${base}/forecast.json?key=${key}&q=${encodeURIComponent(location)}&days=3&alerts=yes`
    )
    // Flatten hourly data from all forecast days
    const hourly: HourlyForecast[] = data.forecast.forecastday.flatMap(
        (day: any) => day.hour || []
    )
    return {
        days: data.forecast.forecastday,
        alerts: data.alerts?.alert || [],
        hourly,
    }
}

/** Compute Sky Visibility Score (0–100) from weather data */
export function computeVisibilityScore(weather: CurrentWeather): number {
    const cloudScore = Math.max(0, 100 - weather.cloud)              // Lower clouds = better
    const visScore = Math.min(100, (weather.vis_km / 10) * 100)      // Higher visibility = better
    const humidScore = Math.max(0, 100 - weather.humidity * 0.5)     // Lower humidity = better
    const precipScore = weather.precip_mm > 0 ? 0 : 100              // No precip = best

    return Math.round(cloudScore * 0.45 + visScore * 0.25 + humidScore * 0.15 + precipScore * 0.15)
}
