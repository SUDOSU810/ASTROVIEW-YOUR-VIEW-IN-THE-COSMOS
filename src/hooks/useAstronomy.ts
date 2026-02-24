import { useEffect, useState } from 'react'
import { getPlanetPositions, type PlanetData } from '../services/astronomyApi'

interface AstronomyData {
    planets: PlanetData[]
    loading: boolean
    error: string | null
}

export function useAstronomy(lat: number, lng: number, locationLoading: boolean): AstronomyData {
    const [data, setData] = useState<AstronomyData>({
        planets: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (locationLoading) return

        async function fetchData() {
            try {
                const planets = await getPlanetPositions(lat, lng)
                setData({ planets, loading: false, error: null })
            } catch (err) {
                setData({
                    planets: [],
                    loading: false,
                    error: err instanceof Error ? err.message : 'Astronomy API failed',
                })
            }
        }

        fetchData()
    }, [lat, lng, locationLoading])

    return data
}
