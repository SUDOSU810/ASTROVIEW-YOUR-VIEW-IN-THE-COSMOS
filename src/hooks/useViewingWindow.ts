import { useEffect, useState } from 'react'
import { computeBestViewingWindow, type ViewingWindow } from '../services/viewingEngine'
import type { HourlyForecast, WeatherAstronomy } from '../services/weatherApi'

interface ViewingWindowData {
    window: ViewingWindow | null
    loading: boolean
}

export function useViewingWindow(
    hourly: HourlyForecast[],
    astronomy: WeatherAstronomy | null,
    moonIllumination: number,
    dataLoading: boolean
): ViewingWindowData {
    const [data, setData] = useState<ViewingWindowData>({
        window: null,
        loading: true,
    })

    useEffect(() => {
        if (dataLoading) return

        const result = computeBestViewingWindow(hourly, astronomy, moonIllumination)
        setData({ window: result, loading: false })
    }, [hourly, astronomy, moonIllumination, dataLoading])

    return data
}
