import { useEffect, useState } from 'react'
import {
    getCurrentWeather,
    getAstronomy,
    getForecast,
    computeVisibilityScore,
    type CurrentWeather,
    type WeatherAstronomy,
    type ForecastDay,
    type WeatherAlert,
    type HourlyForecast,
} from '../services/weatherApi'

interface WeatherData {
    current: CurrentWeather | null
    astronomy: WeatherAstronomy | null
    forecast: ForecastDay[]
    hourly: HourlyForecast[]
    alerts: WeatherAlert[]
    visibilityScore: number
    locationName: string
    loading: boolean
    error: string | null
}

export function useWeather(lat: number, lng: number, locationLoading: boolean): WeatherData {
    const [data, setData] = useState<WeatherData>({
        current: null,
        astronomy: null,
        forecast: [],
        hourly: [],
        alerts: [],
        visibilityScore: 0,
        locationName: '',
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (locationLoading) return

        const query = `${lat},${lng}`

        async function fetchAll() {
            try {
                const [weatherRes, astroRes, forecastRes] = await Promise.all([
                    getCurrentWeather(query),
                    getAstronomy(query),
                    getForecast(query),
                ])

                setData({
                    current: weatherRes.current,
                    astronomy: astroRes,
                    forecast: forecastRes.days,
                    hourly: forecastRes.hourly,
                    alerts: forecastRes.alerts,
                    visibilityScore: computeVisibilityScore(weatherRes.current),
                    locationName: weatherRes.locationName,
                    loading: false,
                    error: null,
                })
            } catch (err) {
                setData((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'Weather fetch failed',
                }))
            }
        }

        fetchAll()
    }, [lat, lng, locationLoading])

    return data
}
