import { useSatellites } from '../hooks/useSatellites'
import SatelliteGlobe from '../components/SatelliteGlobe'
import './Satellite.css'

export default function Satellite() {
  const { satellites, loading, error, selectedSatellite, selectSatellite } =
    useSatellites()

  // Compute quick stats
  const typeCount = satellites.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="satellite-page">
      <div className="satellite-page-header">
        <h1>🛰️ Satellite Tracker</h1>
        <p>
          Real-time tracking of satellites orbiting Earth. Rotate the globe,
          click on a satellite to see its details.
        </p>
      </div>

      <div className="satellite-page-content">
        {/* Stats bar */}
        <div className="satellite-stats-bar">
          <div className="satellite-stat-card">
            <span className="stat-value">{satellites.length}</span>
            <span className="stat-label">Tracked</span>
          </div>
          <div className="satellite-stat-card">
            <span className="stat-value">{typeCount['space-station'] || 0}</span>
            <span className="stat-label">Stations</span>
          </div>
          <div className="satellite-stat-card">
            <span className="stat-value">{typeCount['communication'] || 0}</span>
            <span className="stat-label">Comms</span>
          </div>
          <div className="satellite-stat-card">
            <span className="stat-value">{typeCount['weather'] || 0}</span>
            <span className="stat-label">Weather</span>
          </div>
          <div className="satellite-stat-card">
            <span className="stat-value">{typeCount['navigation'] || 0}</span>
            <span className="stat-label">Navigation</span>
          </div>
        </div>

        {/* 3D Globe */}
        <SatelliteGlobe
          satellites={satellites}
          loading={loading}
          error={error}
          selectedSatellite={selectedSatellite}
          onSelectSatellite={selectSatellite}
        />
      </div>
    </div>
  )
}
