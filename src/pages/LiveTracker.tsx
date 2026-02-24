import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './LiveTracker.css'
import { getISSRegion } from '../services/issApi'
import { useISS } from '../hooks/useISS'
import { useLearnMore } from '../hooks/useLearnMore'
import LearnMoreModal from '../components/LearnMoreModal'

interface IssPosition {
  latitude: number
  longitude: number
}

export default function LiveTracker() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const pathRef = useRef<L.Polyline | null>(null)
  const [pos, setPos] = useState<IssPosition>({ latitude: 0, longitude: 0 })
  const [lastUpdate, setLastUpdate] = useState('')
  const [region, setRegion] = useState('Locating...')
  const pathPoints = useRef<[number, number][]>([])
  const regionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const iss = useISS()
  const learnMore = useLearnMore()

  const issIcon = L.divIcon({
    className: 'iss-marker',
    html: '<div class="iss-dot"><span>🛰️</span></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  const fetchISS = async () => {
    try {
      const res = await fetch('http://api.open-notify.org/iss-now.json')
      const data = await res.json()
      const lat = parseFloat(data.iss_position.latitude)
      const lng = parseFloat(data.iss_position.longitude)
      setPos({ latitude: lat, longitude: lng })
      setLastUpdate(new Date().toLocaleTimeString())

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      }

      pathPoints.current.push([lat, lng])
      if (pathPoints.current.length > 200) pathPoints.current.shift()
      if (pathRef.current) {
        pathRef.current.setLatLngs(pathPoints.current)
      }

      if (leafletMap.current) {
        leafletMap.current.panTo([lat, lng], { animate: true, duration: 1 })
      }

      // Update region every 30 seconds (avoid rate-limiting Nominatim)
      if (!regionTimer.current) {
        updateRegion(lat, lng)
        regionTimer.current = setInterval(() => {
          const latest = pathPoints.current[pathPoints.current.length - 1]
          if (latest) updateRegion(latest[0], latest[1])
        }, 30000)
      }
    } catch {
      // silently fail
    }
  }

  const updateRegion = async (lat: number, lng: number) => {
    try {
      const name = await getISSRegion(lat, lng)
      setRegion(name)
    } catch {
      setRegion('Open Ocean')
    }
  }

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 18 }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const marker = L.marker([0, 0], { icon: issIcon }).addTo(map)
    markerRef.current = marker

    const path = L.polyline([], {
      color: '#00F5FF',
      weight: 2,
      opacity: 0.5,
      dashArray: '6 4',
    }).addTo(map)
    pathRef.current = path

    leafletMap.current = map

    fetchISS()
    const interval = setInterval(fetchISS, 5000)
    return () => {
      clearInterval(interval)
      if (regionTimer.current) clearInterval(regionTimer.current)
      map.remove()
      leafletMap.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const speed = 27580 // ISS average speed km/h
  const altitude = 420  // ISS average altitude km

  return (
    <div className="live-tracker">
      {/* Map */}
      <div ref={mapRef} className="tracker-map" />

      {/* Info Panel */}
      <div className="tracker-panel">
        <h2>🛰️ ISS Live Tracker</h2>

        <div className="tracker-region">
          <span className="tracker-region-dot" />
          Currently over: <strong>{region}</strong>
        </div>

        <div className="tracker-row">
          <span>Latitude</span>
          <strong>{pos.latitude.toFixed(4)}°</strong>
        </div>
        <div className="tracker-row">
          <span>Longitude</span>
          <strong>{pos.longitude.toFixed(4)}°</strong>
        </div>
        <div className="tracker-row">
          <span>Speed</span>
          <strong>{speed.toLocaleString()} km/h</strong>
        </div>
        <div className="tracker-row">
          <span>Altitude</span>
          <strong>{altitude} km</strong>
        </div>
        <div className="tracker-row">
          <span>Last Update</span>
          <strong>{lastUpdate || '—'}</strong>
        </div>
        <div className="tracker-refresh-note">
          <span className="tracker-live-dot" /> Auto-refreshing every 5s
        </div>
        <button className="learn-more-btn" onClick={() => learnMore.search('International Space Station')}>
          Learn More About ISS
        </button>

        {/* Astronaut Panel */}
        <div className="tracker-astronauts">
          <h3>🧑‍🚀 People in Space: {iss.loading ? '...' : iss.astronautCount}</h3>
          {iss.loading ? (
            <p className="tracker-astro-loading">Loading crew data...</p>
          ) : (
            <div className="tracker-astro-list">
              {/* Group by craft */}
              {[...new Set(iss.astronauts.map((a) => a.craft))].map((craft) => (
                <div key={craft} className="tracker-craft-group">
                  <div className="tracker-craft-name">{craft}</div>
                  {iss.astronauts
                    .filter((a) => a.craft === craft)
                    .map((a) => (
                      <div key={a.name} className="tracker-astro-name">
                        {a.name}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learn More Modal */}
      <LearnMoreModal
        isOpen={learnMore.isOpen}
        topic={learnMore.topic}
        items={learnMore.items}
        loading={learnMore.loading}
        error={learnMore.error}
        onClose={learnMore.close}
      />
    </div>
  )
}
