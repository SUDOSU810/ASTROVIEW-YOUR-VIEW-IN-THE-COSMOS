import { useState } from 'react'
import './SkyEvents.css'
import { useUserLocation } from '../hooks/useUserLocation'
import { useWeather } from '../hooks/useWeather'
import { useAstronomy } from '../hooks/useAstronomy'
import { useViewingWindow } from '../hooks/useViewingWindow'
import ViewingWindowCard from '../components/ViewingWindow'

type Tab = 'today' | 'week' | 'month'

interface SkyEvent {
  name: string
  date: string
  time: string
  direction: string
  visibility: 'Excellent' | 'Good' | 'Moderate' | 'Poor'
  description: string
}

// Static events for "this week" and "this month" — these are curated
const STATIC_EVENTS: Record<'week' | 'month', SkyEvent[]> = {
  week: [
    {
      name: 'Venus at Greatest Elongation',
      date: 'Feb 16',
      time: '6:30 PM',
      direction: 'West',
      visibility: 'Excellent',
      description: 'Venus at its farthest from the Sun — best viewing opportunity this month.',
    },
    {
      name: 'Constellation: Orion Peak',
      date: 'Feb 18',
      time: '10:00 PM',
      direction: 'South',
      visibility: 'Good',
      description: 'Orion constellation at peak visibility before it dips below the horizon for spring.',
    },
    {
      name: 'Satellite Flare (Iridium)',
      date: 'Feb 19',
      time: '5:48 AM',
      direction: 'NE',
      visibility: 'Moderate',
      description: 'Brief but bright satellite flare, visible for 5–8 seconds.',
    },
  ],
  month: [
    {
      name: 'Full Snow Moon',
      date: 'Feb 24',
      time: 'All Night',
      direction: 'All Sky',
      visibility: 'Excellent',
      description: 'February\'s full moon — named "Snow Moon" by Native Americans.',
    },
    {
      name: 'Mars Opposition Approach',
      date: 'Feb 28',
      time: '9:00 PM',
      direction: 'East',
      visibility: 'Good',
      description: 'Mars brightens as it approaches opposition. Best viewing conditions.',
    },
    {
      name: 'Zodiacal Light',
      date: 'Late Feb',
      time: 'After Sunset',
      direction: 'West',
      visibility: 'Moderate',
      description: 'Faint pyramid of light visible from dark sites after sunset.',
    },
  ],
}

const VIS_COLOR: Record<string, string> = {
  Excellent: '#00FF88',
  Good: '#00F5FF',
  Moderate: '#FFB800',
  Poor: '#FF4C4C',
}

export default function SkyEvents() {
  const [tab, setTab] = useState<Tab>('today')

  const location = useUserLocation()
  const weather = useWeather(location.lat, location.lng, location.loading)
  const astro = useAstronomy(location.lat, location.lng, location.loading)
  const viewingWindow = useViewingWindow(
    weather.hourly,
    weather.astronomy,
    weather.astronomy?.moon_illumination ?? 0,
    weather.loading
  )

  // ── Build "Tonight" events dynamically ──
  const visiblePlanets = astro.planets.filter((p) => p.isVisible)
  const cloudCover = weather.current?.cloud ?? 0
  const viewingQuality = cloudCover <= 20 ? 'Excellent' : cloudCover <= 40 ? 'Good' : cloudCover <= 70 ? 'Moderate' : 'Poor'
  const qualityPercent = Math.max(0, 100 - cloudCover)

  const todayEvents: SkyEvent[] = []

  // Moon event
  if (weather.astronomy) {
    todayEvents.push({
      name: 'Moon Rise',
      date: 'Tonight',
      time: weather.astronomy.moonrise || 'N/A',
      direction: 'East',
      visibility: (weather.astronomy.moon_illumination ?? 0) < 50 ? 'Excellent' : 'Good',
      description: `${weather.astronomy.moon_phase} moon rises with ${weather.astronomy.moon_illumination}% illumination.`,
    })
  }

  // Visible planets as events
  visiblePlanets.forEach((planet) => {
    todayEvents.push({
      name: `${planet.name} Visible`,
      date: 'Tonight',
      time: planet.rise || 'Dusk',
      direction: planet.altitude > 45 ? 'High' : planet.altitude > 15 ? 'Mid-Sky' : 'Low',
      visibility: viewingQuality as SkyEvent['visibility'],
      description: `${planet.name} is visible tonight. Rises at ${planet.rise}, sets at ${planet.set}.`,
    })
  })

  // If no events yet, add a placeholder
  if (todayEvents.length === 0 && !weather.loading && !astro.loading) {
    todayEvents.push({
      name: 'Stargazing Conditions',
      date: 'Tonight',
      time: weather.astronomy?.sunset || 'Evening',
      direction: 'All Sky',
      visibility: viewingQuality as SkyEvent['visibility'],
      description: `Cloud cover at ${cloudCover}%. ${viewingQuality} conditions for stargazing.`,
    })
  }

  const currentEvents: SkyEvent[] =
    tab === 'today' ? todayEvents : STATIC_EVENTS[tab]

  // Moon & Sun data from weather API
  const moonPhase = weather.astronomy?.moon_phase || '—'
  const moonIllumination = weather.astronomy?.moon_illumination ?? 0
  const moonrise = weather.astronomy?.moonrise || '—'
  const moonset = weather.astronomy?.moonset || '—'
  const sunrise = weather.astronomy?.sunrise || '—'
  const sunset = weather.astronomy?.sunset || '—'

  // Planet rise times
  const jupiter = astro.planets.find((p) => p.name.toLowerCase() === 'jupiter')
  const saturn = astro.planets.find((p) => p.name.toLowerCase() === 'saturn')

  const moonBrightness =
    moonIllumination < 30 ? 'Low' : moonIllumination < 70 ? 'Moderate' : 'High'

  return (
    <div className="sky-events">
      <div className="sky-header">
        <h1>🌠 Sky Events</h1>
        <p>Discover what's visible in your sky — tonight and beyond.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="sky-tabs">
        {(['today', 'week', 'month'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`sky-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Tonight' : t === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* ── Event Cards ── */}
      <div className="sky-event-list">
        {weather.loading || astro.loading ? (
          <div className="sky-event-card">
            <div className="sky-event-top">
              <h3>Loading sky events...</h3>
            </div>
            <p className="sky-event-desc">Fetching data from APIs...</p>
          </div>
        ) : (
          currentEvents.map((ev, i) => (
            <div key={i} className="sky-event-card">
              <div className="sky-event-top">
                <h3>{ev.name}</h3>
                <span
                  className="sky-vis-badge"
                  style={{
                    color: VIS_COLOR[ev.visibility],
                    borderColor: VIS_COLOR[ev.visibility] + '40',
                  }}
                >
                  {ev.visibility}
                </span>
              </div>
              <div className="sky-event-meta">
                <span>📅 {ev.date}</span>
                <span>⏰ {ev.time}</span>
                <span>🧭 {ev.direction}</span>
              </div>
              <p className="sky-event-desc">{ev.description}</p>
            </div>
          ))
        )}
      </div>

      {/* ── Moon & Planet Panel ── */}
      <div className="sky-panels">
        <div className="sky-panel">
          <h3>🌙 Moon Info</h3>
          <div className="sky-panel-row">
            <span>Phase</span>
            <strong>{weather.loading ? '...' : moonPhase}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Illumination</span>
            <strong>{weather.loading ? '...' : `${moonIllumination}%`}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Moonrise</span>
            <strong>{weather.loading ? '...' : moonrise}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Moonset</span>
            <strong>{weather.loading ? '...' : moonset}</strong>
          </div>
        </div>

        <div className="sky-panel">
          <h3>☀️ Sun & Planets</h3>
          <div className="sky-panel-row">
            <span>Sunrise</span>
            <strong>{weather.loading ? '...' : sunrise}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Sunset</span>
            <strong>{weather.loading ? '...' : sunset}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Jupiter Rise</span>
            <strong>{astro.loading ? '...' : jupiter?.rise || 'N/A'}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Saturn Rise</span>
            <strong>{astro.loading ? '...' : saturn?.rise || 'N/A'}</strong>
          </div>
        </div>

        <div className="sky-panel">
          <h3>📊 Viewing Quality</h3>
          <div className="quality-meter">
            <div className="quality-labels">
              <span>Poor</span>
              <span>Moderate</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <div className="quality-bar">
              <div className="quality-fill" style={{ width: `${qualityPercent}%` }} />
              <div className="quality-marker" style={{ left: `${qualityPercent}%` }} />
            </div>
          </div>
          <div className="sky-panel-row" style={{ marginTop: '1rem' }}>
            <span>Cloud Cover</span>
            <strong>{weather.loading ? '...' : `${cloudCover}%`}</strong>
          </div>
          <div className="sky-panel-row">
            <span>Moon Brightness</span>
            <strong>{weather.loading ? '...' : moonBrightness}</strong>
          </div>
        </div>
      </div>

      {/* ── Best Viewing Window ── */}
      <div className="sky-viewing-window">
        <ViewingWindowCard window={viewingWindow.window} loading={viewingWindow.loading} />
      </div>
    </div>
  )
}
