import { useEffect, useState } from 'react'
import {
    getKpIndex,
    getSolarFlareActivity,
    getGeomagneticStorm,
    type KpIndexData,
    type SolarFlareData,
    type GeomagneticData,
} from '../services/noaaApi'

interface SpaceWeatherData {
    kpIndex: KpIndexData | null
    solarFlare: SolarFlareData | null
    geomagnetic: GeomagneticData | null
    loading: boolean
    error: string | null
}

export function useSpaceWeather(): SpaceWeatherData {
    const [data, setData] = useState<SpaceWeatherData>({
        kpIndex: null,
        solarFlare: null,
        geomagnetic: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        async function fetchAll() {
            try {
                const [kp, flare, geo] = await Promise.all([
                    getKpIndex(),
                    getSolarFlareActivity(),
                    getGeomagneticStorm(),
                ])
                setData({
                    kpIndex: kp,
                    solarFlare: flare,
                    geomagnetic: geo,
                    loading: false,
                    error: null,
                })
            } catch (err) {
                setData((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'NOAA fetch failed',
                }))
            }
        }

        fetchAll()
    }, [])

    return data
}
