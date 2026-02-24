import { useEffect, useState } from 'react'
import { generateAlerts, type Alert } from '../services/alertEngine'
import type { CurrentWeather, WeatherAstronomy, HourlyForecast } from '../services/weatherApi'
import type { KpIndexData } from '../services/noaaApi'

interface AlertsData {
    alerts: Alert[]
    loading: boolean
}

export function useAlerts(
    weather: CurrentWeather | null,
    astronomy: WeatherAstronomy | null,
    hourly: HourlyForecast[],
    kpIndex: KpIndexData | null,
    lat: number,
    lng: number,
    dataLoading: boolean
): AlertsData {
    const [data, setData] = useState<AlertsData>({ alerts: [], loading: true })

    useEffect(() => {
        if (dataLoading) return

        const alerts = generateAlerts({
            weather,
            astronomy,
            hourly,
            kpIndex,
            lat,
            lng,
        })

        setData({ alerts, loading: false })
    }, [weather, astronomy, hourly, kpIndex, lat, lng, dataLoading])

    return data
}
