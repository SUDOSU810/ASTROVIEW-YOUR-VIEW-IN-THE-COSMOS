import { useEffect, useState } from 'react'
import { DEFAULT_LOCATION } from '../services/api'

interface UserLocation {
    lat: number
    lng: number
    city: string
    loading: boolean
}

export function useUserLocation(): UserLocation {
    const [location, setLocation] = useState<UserLocation>({
        ...DEFAULT_LOCATION,
        loading: true,
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({ ...prev, loading: false }))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    city: '', // Will be filled by weather API
                    loading: false,
                })
            },
            () => {
                // Permission denied or error — use default
                setLocation((prev) => ({ ...prev, loading: false }))
            },
            { timeout: 5000, enableHighAccuracy: false }
        )
    }, [])

    return location
}
