import { useEffect, useState } from 'react'
import { getAPOD, getNeoAsteroids, type APOD, type NeoAsteroid } from '../services/nasaApi'

interface NasaData {
    apod: APOD | null
    asteroidCount: number
    hazardousCount: number
    asteroids: NeoAsteroid[]
    loading: boolean
    error: string | null
}

export function useNasa(): NasaData {
    const [data, setData] = useState<NasaData>({
        apod: null,
        asteroidCount: 0,
        hazardousCount: 0,
        asteroids: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        async function fetchAll() {
            try {
                const [apod, neo] = await Promise.all([getAPOD(), getNeoAsteroids()])
                setData({
                    apod,
                    asteroidCount: neo.count,
                    hazardousCount: neo.hazardousCount,
                    asteroids: neo.asteroids,
                    loading: false,
                    error: null,
                })
            } catch (err) {
                setData((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'NASA fetch failed',
                }))
            }
        }

        fetchAll()
    }, [])

    return data
}
