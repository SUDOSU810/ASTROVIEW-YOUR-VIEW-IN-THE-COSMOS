import { useEffect, useState } from 'react'
import { getAstronauts, type Astronaut } from '../services/issApi'

interface ISSData {
    astronautCount: number
    astronauts: Astronaut[]
    loading: boolean
    error: string | null
}

export function useISS(): ISSData {
    const [data, setData] = useState<ISSData>({
        astronautCount: 0,
        astronauts: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getAstronauts()
                setData({
                    astronautCount: result.count,
                    astronauts: result.people,
                    loading: false,
                    error: null,
                })
            } catch (err) {
                setData((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'ISS fetch failed',
                }))
            }
        }

        fetchData()
    }, [])

    return data
}
