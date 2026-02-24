import { useEffect, useState } from 'react'
import { analyzeImpacts, type ImpactAnalysis } from '../services/impactEngine'
import type { CurrentWeather, ForecastDay } from '../services/weatherApi'
import type { KpIndexData } from '../services/noaaApi'

interface ImpactData {
    analysis: ImpactAnalysis | null
    loading: boolean
}

export function useImpactAnalysis(
    weather: CurrentWeather | null,
    forecast: ForecastDay[],
    kpIndex: KpIndexData | null,
    dataLoading: boolean
): ImpactData {
    const [data, setData] = useState<ImpactData>({
        analysis: null,
        loading: true,
    })

    useEffect(() => {
        if (dataLoading) return

        const analysis = analyzeImpacts(weather, forecast, kpIndex)
        setData({ analysis, loading: false })
    }, [weather, forecast, kpIndex, dataLoading])

    return data
}
