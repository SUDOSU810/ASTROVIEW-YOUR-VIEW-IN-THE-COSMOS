import { useEffect, useState } from 'react'
import { getLatestEarthImage, type EpicImage } from '../services/epicApi'

interface EarthImageryData {
    image: EpicImage | null
    loading: boolean
    error: string | null
}

export function useEarthImagery(): EarthImageryData {
    const [data, setData] = useState<EarthImageryData>({
        image: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const image = await getLatestEarthImage()
                setData({ image, loading: false, error: null })
            } catch (err) {
                setData({
                    image: null,
                    loading: false,
                    error: err instanceof Error ? err.message : 'EPIC fetch failed',
                })
            }
        }

        fetchData()
    }, [])

    return data
}
