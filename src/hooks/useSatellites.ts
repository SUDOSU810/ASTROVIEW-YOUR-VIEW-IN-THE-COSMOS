import { useEffect, useRef, useState, useCallback } from 'react'
import {
    fetchTLEData,
    propagatePositions,
    type SatelliteInfo,
} from '../services/satelliteApi'

interface UseSatellitesReturn {
    satellites: SatelliteInfo[]
    loading: boolean
    error: string | null
    selectedSatellite: SatelliteInfo | null
    selectSatellite: (sat: SatelliteInfo | null) => void
}

export function useSatellites(): UseSatellitesReturn {
    const [satellites, setSatellites] = useState<SatelliteInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedSatellite, setSelectedSatellite] =
        useState<SatelliteInfo | null>(null)

    // Store TLE records so we don't re-fetch on every propagation
    const tleRef = useRef<Awaited<ReturnType<typeof fetchTLEData>>>([])
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const selectSatellite = useCallback((sat: SatelliteInfo | null) => {
        setSelectedSatellite(sat)
    }, [])

    useEffect(() => {
        let mounted = true

        async function init() {
            try {
                const tleRecords = await fetchTLEData()
                if (!mounted) return
                tleRef.current = tleRecords

                // Initial propagation
                const positions = propagatePositions(tleRecords)
                setSatellites(positions)
                setLoading(false)

                // Update positions every 2 seconds
                intervalRef.current = setInterval(() => {
                    if (!mounted) return
                    const updated = propagatePositions(tleRef.current)
                    setSatellites(updated)

                    // Update selected satellite if one is selected
                    setSelectedSatellite((prev) => {
                        if (!prev) return null
                        return (
                            updated.find((s) => s.noradId === prev.noradId) ?? null
                        )
                    })
                }, 2000)
            } catch (err) {
                if (!mounted) return
                setError(
                    err instanceof Error ? err.message : 'Failed to load satellite data'
                )
                setLoading(false)
            }
        }

        init()

        return () => {
            mounted = false
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    return { satellites, loading, error, selectedSatellite, selectSatellite }
}
