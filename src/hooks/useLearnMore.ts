import { useState, useCallback } from 'react'
import { searchNasaImages, type NasaLibraryItem } from '../services/nasaLibrary'

interface LearnMoreData {
    items: NasaLibraryItem[]
    topic: string
    loading: boolean
    error: string | null
    isOpen: boolean
}

export function useLearnMore() {
    const [data, setData] = useState<LearnMoreData>({
        items: [],
        topic: '',
        loading: false,
        error: null,
        isOpen: false,
    })

    const search = useCallback(async (topic: string) => {
        setData({ items: [], topic, loading: true, error: null, isOpen: true })
        try {
            const items = await searchNasaImages(topic)
            setData({ items, topic, loading: false, error: null, isOpen: true })
        } catch (err) {
            setData({
                items: [],
                topic,
                loading: false,
                error: err instanceof Error ? err.message : 'Search failed',
                isOpen: true,
            })
        }
    }, [])

    const close = useCallback(() => {
        setData((prev) => ({ ...prev, isOpen: false }))
    }, [])

    return { ...data, search, close }
}
