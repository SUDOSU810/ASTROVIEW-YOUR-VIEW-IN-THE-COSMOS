import { useEffect, useState } from 'react'
import './Dashboard.css'
import { useUserLocation } from '../hooks/useUserLocation'
import { useWeather } from '../hooks/useWeather'
import { useNasa } from '../hooks/useNasa'
import { useSpaceWeather } from '../hooks/useSpaceWeather'
import { useISS } from '../hooks/useISS'
import { useAstronomy } from '../hooks/useAstronomy'
import { useAlerts } from '../hooks/useAlerts'
import { useViewingWindow } from '../hooks/useViewingWindow'
import { useLearnMore } from '../hooks/useLearnMore'
import AlertBanner from '../components/AlertBanner'
import ViewingWindowCard from '../components/ViewingWindow'
import LearnMoreModal from '../components/LearnMoreModal'
import WeatherLandscapeCard from '../components/WeatherLandscapeCard'

export default function Dashboard() {
  const [time, setTime] = useState(new Date())

  // ── Live data hooks ──
  const location = useUserLocation()
  const weather = useWeather(location.lat, location.lng, location.loading)
  const nasa = useNasa()
  const space = useSpaceWeather()
  const iss = useISS()
  const astro = useAstronomy(location.lat, location.lng, location.loading)

  // ── New Phase 2 hooks ──
  const alerts = useAlerts(
    weather.current,
    weather.astronomy,
    weather.hourly,
    space.kpIndex,
    location.lat,
    location.lng,
    weather.loading || space.loading
  )
  const viewingWindow = useViewingWindow(
    weather.hourly,
    weather.astronomy,
    weather.astronomy?.moon_illumination ?? 0,
    weather.loading
  )
  const learnMore = useLearnMore()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Derived values ──
  const visibilityScore = weather.visibilityScore
  const moonPhase = weather.astronomy?.moon_phase || 'Loading...'
  const moonIllumination = weather.astronomy?.moon_illumination ?? 0
  const solarActivity = space.kpIndex
    ? space.kpIndex.kpLevel
    : 'Loading...'
  const kpValue = space.kpIndex?.kpValue ?? 0
  const asteroidsToday = nasa.asteroidCount
  const hazardousCount = nasa.hazardousCount
  const weatherStatus = weather.current?.condition?.text || 'Loading...'
  const temp = weather.current?.temp_c ?? 0
  const humidity = weather.current?.humidity ?? 0
  const locationName = weather.locationName || location.city || 'Locating...'

  // People in space
  const peopleInSpace = iss.astronautCount

  // Visible planets tonight
  const visiblePlanets = astro.planets.filter((p) => p.isVisible)

  const getVisibilityLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#00FF88' }
    if (score >= 60) return { label: 'Good', color: '#00F5FF' }
    if (score >= 40) return { label: 'Moderate', color: '#FFB800' }
    return { label: 'Poor', color: '#FF4C4C' }
  }

  const vis = getVisibilityLabel(visibilityScore)

  // Smart summary from real data
  const smartSummary = weather.loading
    ? 'Analyzing sky conditions...'
    : `${weatherStatus} tonight with ${vis.label.toLowerCase()} viewing conditions.` +
    ` Moon is ${moonPhase.toLowerCase()} at ${moonIllumination}% illumination` +
    (visiblePlanets.length > 0
      ? `. ${visiblePlanets.map((p) => p.name).join(', ')} visible tonight`
      : '') +
    `. ${peopleInSpace} humans currently in space.`

  return (
    <div className="dashboard">
      {/* ── Alerts ── */}
      <AlertBanner alerts={alerts.alerts} loading={alerts.loading} />

      {/* ── Top Bar ── */}
      <div className="dash-topbar">
        <div className="dash-location">
          <span className="dash-location-dot" />
          <span>{locationName}</span>
          <span className="dash-time">{time.toLocaleTimeString()}</span>
        </div>
        <div className="dash-vis-badge" style={{ borderColor: vis.color + '40' }}>
          <span className="dash-vis-dot" style={{ background: vis.color }} />
          {weather.loading
            ? 'Calculating sky visibility...'
            : `Sky Visibility: ${visibilityScore}/100 — ${vis.label}`}
        </div>
      </div>

      {/* ── What's Above You Tonight ── */}
      <div className="dash-section-title">
        <h2>🌌 What's Above You Tonight?</h2>
      </div>

      <div className="dash-cards-hero">
        <div className="dash-card dash-card-iss">
          <div className="dash-card-icon">🧑‍🚀</div>
          <div className="dash-card-label">People in Space</div>
          <div className="dash-card-value">{iss.loading ? '...' : peopleInSpace}</div>
          <div className="dash-card-sub">
            {iss.loading
              ? 'Loading...'
              : `aboard ${[...new Set(iss.astronauts.map((a) => a.craft))].join(', ')}`}
          </div>
          <button className="learn-more-btn" onClick={() => learnMore.search('International Space Station')}>
            Learn More
          </button>
        </div>
        <div className="dash-card dash-card-moon">
          <div className="dash-card-icon">🌙</div>
          <div className="dash-card-label">Moon Phase</div>
          <div className="dash-card-value">{moonPhase}</div>
          <div className="dash-card-sub">{moonIllumination}% illumination</div>
          <button className="learn-more-btn" onClick={() => learnMore.search('Moon')}>
            Learn More
          </button>
        </div>
        <div className="dash-card dash-card-meteor">
          <div className="dash-card-icon">🌠</div>
          <div className="dash-card-label">Visible Planets</div>
          <div className="dash-card-value">
            {astro.loading ? '...' : `${visiblePlanets.length} tonight`}
          </div>
          <div className="dash-card-sub">
            {astro.loading
              ? 'Loading...'
              : visiblePlanets.length > 0
                ? visiblePlanets.map((p) => p.name).join(', ')
                : 'None visible right now'}
          </div>
        </div>
        <div className="dash-card dash-card-sky">
          <div className="dash-card-icon">🌤️</div>
          <div className="dash-card-label">Sky Visibility</div>
          <div className="dash-card-value" style={{ color: vis.color }}>
            {weather.loading ? '...' : `${visibilityScore}/100`}
          </div>
          <div className="dash-vis-bar">
            <div
              className="dash-vis-fill"
              style={{ width: `${visibilityScore}%`, background: vis.color }}
            />
          </div>
        </div>
      </div>

      {/* ── Best Viewing Window ── */}
      <div className="dash-grid-2">
        <ViewingWindowCard window={viewingWindow.window} loading={viewingWindow.loading} />

        <div className="dash-card-stack">
          <div className="dash-card">
            <div className="dash-card-icon">☀️</div>
            <div className="dash-card-label">Solar Activity</div>
            <div className="dash-card-value">{solarActivity}</div>
            <div className="dash-card-sub">
              Kp Index: {space.loading ? '...' : kpValue.toFixed(1)}
            </div>
            <button className="learn-more-btn" onClick={() => learnMore.search('Solar Flare')}>
              Learn More
            </button>
          </div>
          <div className="dash-card">
            <div className="dash-card-icon">☄️</div>
            <div className="dash-card-label">Near-Earth Asteroids</div>
            <div className="dash-card-value">
              {nasa.loading ? '...' : `${asteroidsToday} today`}
            </div>
            <div className="dash-card-sub">
              {nasa.loading
                ? 'Loading...'
                : hazardousCount > 0
                  ? `${hazardousCount} potentially hazardous`
                  : 'None hazardous'}
            </div>
            <button className="learn-more-btn" onClick={() => learnMore.search('Asteroid')}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* ── APOD + Weather ── */}
      <div className="dash-grid-2">
        <div className="dash-card dash-card-apod">
          <div className="dash-card-label">📸 Astronomy Picture of the Day</div>
          {nasa.apod ? (
            <>
              {nasa.apod.media_type === 'image' ? (
                <img src={nasa.apod.url} alt={nasa.apod.title} className="apod-img" />
              ) : (
                <iframe
                  src={nasa.apod.url}
                  title={nasa.apod.title}
                  className="apod-iframe"
                  allowFullScreen
                />
              )}
              <h3 className="apod-title">{nasa.apod.title}</h3>
              <p className="apod-desc">
                {nasa.apod.explanation?.slice(0, 180)}...
              </p>
            </>
          ) : (
            <div className="apod-loading">
              {nasa.error ? 'Failed to load APOD' : 'Loading NASA APOD...'}
            </div>
          )}
        </div>

        <WeatherLandscapeCard
          weatherStatus={weatherStatus}
          temp={temp}
          humidity={humidity}
          locationName={locationName}
          loading={weather.loading}
          forecast={weather.forecast}
        />
      </div>

      {/* ── Smart Summary ── */}
      <div className="dash-smart-summary">
        <div className="dash-smart-icon">🧠</div>
        <div className="dash-smart-text">
          <strong>Smart Summary:</strong> {smartSummary}
        </div>
      </div>

      {/* ── Learn More Modal ── */}
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
