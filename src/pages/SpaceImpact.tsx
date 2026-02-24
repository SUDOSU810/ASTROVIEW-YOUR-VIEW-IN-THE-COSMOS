import './SpaceImpact.css'
import { useUserLocation } from '../hooks/useUserLocation'
import { useWeather } from '../hooks/useWeather'
import { useSpaceWeather } from '../hooks/useSpaceWeather'
import { useSatellites } from '../hooks/useSatellites'
import { useImpactAnalysis } from '../hooks/useImpactAnalysis'
import { useLearnMore } from '../hooks/useLearnMore'
import LearnMoreModal from '../components/LearnMoreModal'
import SatelliteGlobe from '../components/SatelliteGlobe'
import type { ImpactChain } from '../services/impactEngine'

export default function SpaceImpact() {
  const location = useUserLocation()
  const weather = useWeather(location.lat, location.lng, location.loading)
  const space = useSpaceWeather()
  const satData = useSatellites()
  const impact = useImpactAnalysis(
    weather.current,
    weather.forecast,
    space.kpIndex,
    weather.loading || space.loading
  )
  const learnMore = useLearnMore()

  // ── Weather Impact Data ──
  const rainChance = weather.forecast[0]?.day?.daily_chance_of_rain ?? 0
  const rainDesc =
    rainChance > 60
      ? 'Significant rainfall expected. Plan indoor activities.'
      : rainChance > 30
        ? 'Moderate chance of rain. Keep an umbrella handy.'
        : 'Low precipitation expected. Good conditions ahead.'
  const rainStatus =
    rainChance > 60 ? 'High Risk' : rainChance > 30 ? 'Moderate' : 'Low Risk'
  const rainStatusClass =
    rainChance > 60 ? 'status-high' : rainChance > 30 ? 'status-moderate' : 'status-low'
  const rainColor =
    rainChance > 60 ? '#FF4C4C' : rainChance > 30 ? '#FFB800' : '#00F5FF'

  const temp = weather.current?.temp_c ?? 0
  const feelsLike = weather.current?.feelslike_c ?? 0
  const tempDiff = Math.abs(feelsLike - temp)
  const heatStatus =
    temp > 40 ? 'Extreme' : temp > 35 ? 'High' : temp > 30 ? 'Moderate' : 'Normal'
  const heatStatusClass =
    temp > 40 ? 'status-high' : temp > 35 ? 'status-moderate' : temp > 30 ? 'status-moderate' : 'status-low'
  const heatPercent = Math.min(100, Math.round((temp / 50) * 100))
  const heatColor =
    temp > 40 ? '#FF4C4C' : temp > 35 ? '#FFB800' : temp > 30 ? '#FFB800' : '#00FF88'
  const heatDesc =
    temp > 40
      ? `Extreme heat at ${temp}°C (feels like ${feelsLike}°C). Stay indoors.`
      : temp > 35
        ? `High temperature at ${temp}°C. Stay hydrated and avoid prolonged sun exposure.`
        : temp > 30
          ? `Temperatures ${tempDiff > 2 ? `feel like ${feelsLike}°C` : 'are warm'}. Stay hydrated.`
          : `Temperature at ${temp}°C. Comfortable conditions.`

  const cloudCover = weather.current?.cloud ?? 0
  const cloudStatus =
    cloudCover > 70 ? 'Overcast' : cloudCover > 40 ? 'Partly Cloudy' : 'Clear'
  const cloudStatusClass = cloudCover > 70 ? 'status-moderate' : 'status-low'
  const cloudColor = cloudCover > 70 ? '#FFB800' : cloudCover > 40 ? '#00F5FF' : '#00FF88'
  const cloudDesc =
    cloudCover > 70
      ? `Heavy cloud cover at ${cloudCover}%. Poor conditions for stargazing.`
      : cloudCover > 40
        ? `Partial cloud cover at ${cloudCover}%. Some windows for observation.`
        : `Sparse clouds at ${cloudCover}%. Clear skies for stargazing tonight.`

  // ── Disaster Awareness ──
  const windSpeed = weather.current?.wind_kph ?? 0
  const windDir = weather.current?.wind_dir ?? ''
  const windStatus =
    windSpeed > 60 ? 'Warning' : windSpeed > 40 ? 'Advisory' : 'Normal'
  const windStatusClass =
    windSpeed > 60 ? 'status-high' : windSpeed > 40 ? 'status-moderate' : 'status-low'
  const windPercent = Math.min(100, Math.round((windSpeed / 100) * 100))
  const windColor =
    windSpeed > 60 ? '#FF4C4C' : windSpeed > 40 ? '#FFB800' : '#00FF88'
  const windDesc =
    windSpeed > 60
      ? `Strong winds at ${windSpeed} km/h ${windDir}. Seek shelter.`
      : windSpeed > 40
        ? `Wind gusts up to ${windSpeed} km/h ${windDir}. Secure loose outdoor items.`
        : `Light winds at ${windSpeed} km/h ${windDir}. No concerns.`

  const alerts = weather.alerts
  const hasRainAlert = rainChance > 70
  const hasStormAlert = alerts.some(
    (a) =>
      a.event?.toLowerCase().includes('storm') ||
      a.event?.toLowerCase().includes('cyclone')
  )
  const stormDesc = hasStormAlert
    ? alerts.find((a) => a.event?.toLowerCase().includes('storm'))?.desc ||
    'Storm activity detected in your region.'
    : 'No tropical depressions or cyclone activity detected in your region.'

  // ── Solar Activity (from NOAA) ──
  const kpValue = space.kpIndex?.kpValue ?? 0
  const kpLevel = space.kpIndex?.kpLevel ?? 'Loading...'
  const kpDesc =
    kpValue >= 5
      ? `Current Kp Index is ${kpValue.toFixed(1)}, indicating ${kpLevel.toLowerCase()} conditions. Radio propagation issues likely.`
      : kpValue >= 3
        ? `Current Kp Index is ${kpValue.toFixed(1)}, indicating ${kpLevel.toLowerCase()} geomagnetic conditions. Minor radio propagation issues possible.`
        : `Current Kp Index is ${kpValue.toFixed(1)}, indicating ${kpLevel.toLowerCase()} conditions. No significant geomagnetic disturbances.`

  const auroraChance = space.geomagnetic?.auroraChance ?? 0
  const auroraStatus =
    auroraChance > 50 ? 'Likely' : auroraChance > 20 ? 'Possible' : 'Unlikely'
  const auroraStatusClass =
    auroraChance > 50 ? 'status-high' : auroraChance > 20 ? 'status-moderate' : 'status-low'
  const auroraColor = auroraChance > 50 ? '#00FF88' : auroraChance > 20 ? '#FFB800' : '#7B61FF'
  const auroraDesc =
    auroraChance > 50
      ? `Strong aurora activity possible! Check high-latitude sky views.`
      : auroraChance > 20
        ? `Some aurora activity possible at high latitudes.`
        : `Aurora activity is unlikely at your latitude. Visible primarily above 60°N tonight.`

  const flareLevel = space.solarFlare?.level ?? 'Normal'
  const flareStatusClass =
    flareLevel === 'High' ? 'status-high' : flareLevel === 'Elevated' ? 'status-moderate' : 'status-low'

  const flareDesc =
    flareLevel === 'High'
      ? `High solar flare activity detected (${space.solarFlare?.maxClass}). Watch for radio disruptions.`
      : flareLevel === 'Elevated'
        ? `Elevated solar flare activity (${space.solarFlare?.maxClass}). Minor effects possible.`
        : 'No significant solar flare activity in the past 24 hours. X-ray flux within normal range.'

  const kpActiveUpTo = Math.round(kpValue)

  const isLoading = weather.loading || space.loading

  const severityColor = (s: ImpactChain['severity']) =>
    s === 'critical' ? '#FF4C4C' : s === 'high' ? '#FF6B35' : s === 'moderate' ? '#FFB800' : '#00FF88'

  const severityClass = (s: ImpactChain['severity']) =>
    s === 'critical' || s === 'high' ? 'status-high' : s === 'moderate' ? 'status-moderate' : 'status-low'

  return (
    <div className="space-impact">
      <div className="impact-header">
        <h1>🌍 Space Impact</h1>
        <p>How space weather and orbital activity affect life on Earth.</p>
      </div>

      {isLoading && (
        <div className="impact-loading">Loading real-time data from weather & space APIs...</div>
      )}

      {/* ── Earth Satellite Imagery — 3D Globe ── */}
      <section className="impact-section">
        <h2>🛰️ Earth Satellite Imagery</h2>
        <p className="section-subtitle">
          Real-time satellite tracking powered by NORAD two-line element data.
          Click any satellite for details.
        </p>
        <SatelliteGlobe
          satellites={satData.satellites}
          loading={satData.loading}
          error={satData.error}
          selectedSatellite={satData.selectedSatellite}
          onSelectSatellite={satData.selectSatellite}
        />
      </section>

      {/* ── Space → Earth Impact Chain ── */}
      {impact.analysis && (
        <section className="impact-section">
          <h2>🔗 Space → Earth Impact Analysis</h2>
          <p className="section-subtitle">
            How space data translates to atmospheric effects, Earth impact, and human relevance.
          </p>
          <div className="impact-chain-grid">
            {[
              impact.analysis.climateImpact,
              impact.analysis.agricultureImpact,
              impact.analysis.disasterImpact,
              impact.analysis.solarImpact,
            ].map((chain, i) => (
              <div key={i} className="impact-chain-card">
                <div className="chain-header">
                  <span className="chain-icon">{chain.icon}</span>
                  <h4>{chain.type}</h4>
                  <span className={`impact-status ${severityClass(chain.severity)}`}>
                    {chain.severity.toUpperCase()}
                  </span>
                </div>
                <div className="chain-flow">
                  <div className="chain-step">
                    <span className="chain-label">Cause</span>
                    <p>{chain.cause}</p>
                  </div>
                  <div className="chain-arrow">→</div>
                  <div className="chain-step">
                    <span className="chain-label">Atmospheric Effect</span>
                    <p>{chain.atmosphericEffect}</p>
                  </div>
                  <div className="chain-arrow">→</div>
                  <div className="chain-step">
                    <span className="chain-label">Earth Impact</span>
                    <p>{chain.earthImpact}</p>
                  </div>
                  <div className="chain-arrow">→</div>
                  <div className="chain-step chain-step-human">
                    <span className="chain-label">Human Relevance</span>
                    <p>{chain.humanRelevance}</p>
                  </div>
                </div>
                <div className="chain-severity-bar">
                  <div
                    className="chain-severity-fill"
                    style={{
                      width: chain.severity === 'critical' ? '100%' :
                        chain.severity === 'high' ? '75%' :
                          chain.severity === 'moderate' ? '50%' : '25%',
                      background: severityColor(chain.severity),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Section 1: Weather Impact ── */}
      <section className="impact-section">
        <h2>🌦️ Weather Impact</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🌧️</span>
              <span className={`impact-status ${rainStatusClass}`}>{rainStatus}</span>
            </div>
            <h3>Rain Forecast</h3>
            <p>{rainDesc}</p>
            <div className="impact-meter">
              <div
                className="impact-meter-fill"
                style={{ width: `${rainChance}%`, background: rainColor }}
              />
            </div>
            <span className="impact-meter-label">Precipitation: {rainChance}%</span>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🌡️</span>
              <span className={`impact-status ${heatStatusClass}`}>{heatStatus}</span>
            </div>
            <h3>Heatwave Alert</h3>
            <p>{heatDesc}</p>
            <div className="impact-meter">
              <div
                className="impact-meter-fill"
                style={{ width: `${heatPercent}%`, background: heatColor }}
              />
            </div>
            <span className="impact-meter-label">
              Temperature: {weather.loading ? '...' : `${temp}°C`}
            </span>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">☁️</span>
              <span className={`impact-status ${cloudStatusClass}`}>{cloudStatus}</span>
            </div>
            <h3>Cloud Movement</h3>
            <p>{cloudDesc}</p>
            <div className="impact-meter">
              <div
                className="impact-meter-fill"
                style={{ width: `${cloudCover}%`, background: cloudColor }}
              />
            </div>
            <span className="impact-meter-label">Cloud Cover: {cloudCover}%</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Disaster Awareness ── */}
      <section className="impact-section">
        <h2>⚠️ Disaster Awareness</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🌊</span>
              <span className={`impact-status ${hasRainAlert ? 'status-moderate' : 'status-low'}`}>
                {hasRainAlert ? 'Alert' : 'No Warning'}
              </span>
            </div>
            <h3>Heavy Rainfall</h3>
            <p>
              {hasRainAlert
                ? `Heavy rainfall warning: ${rainChance}% chance of significant precipitation.`
                : 'No heavy rainfall warnings active for your region. Seasonal averages remain normal.'}
            </p>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🌀</span>
              <span className={`impact-status ${hasStormAlert ? 'status-high' : 'status-low'}`}>
                {hasStormAlert ? 'Active' : 'No Threat'}
              </span>
            </div>
            <h3>Storm Risk</h3>
            <p>{stormDesc}</p>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">💨</span>
              <span className={`impact-status ${windStatusClass}`}>{windStatus}</span>
            </div>
            <h3>Wind Alerts</h3>
            <p>{windDesc}</p>
            <div className="impact-meter">
              <div
                className="impact-meter-fill"
                style={{ width: `${windPercent}%`, background: windColor }}
              />
            </div>
            <span className="impact-meter-label">
              Wind: {weather.loading ? '...' : `${windSpeed} km/h`}
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 3: Solar Activity ── */}
      <section className="impact-section">
        <h2>☀️ Solar Activity</h2>
        <div className="impact-grid">
          <div className="impact-card impact-card-wide">
            <div className="impact-card-top">
              <span className="impact-icon">📡</span>
              <span
                className={`impact-status ${kpValue >= 5 ? 'status-high' : kpValue >= 3 ? 'status-moderate' : 'status-low'
                  }`}
              >
                {space.loading ? 'Loading...' : kpLevel}
              </span>
            </div>
            <h3>Kp Index — Geomagnetic Activity</h3>
            <p>{space.loading ? 'Fetching NOAA data...' : kpDesc}</p>
            <div className="kp-scale">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <div
                  key={level}
                  className={`kp-block ${level <= kpActiveUpTo ? 'kp-active' : ''}`}
                  style={{
                    background:
                      level <= kpActiveUpTo
                        ? level <= 3
                          ? '#00FF88'
                          : level <= 5
                            ? '#FFB800'
                            : level <= 7
                              ? '#FF6B35'
                              : '#FF4C4C'
                        : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {level}
                </div>
              ))}
            </div>
            <div className="kp-labels">
              <span>Quiet</span>
              <span>Active</span>
              <span>Storm</span>
              <span>Severe</span>
            </div>
            <button className="learn-more-btn" onClick={() => learnMore.search('Solar Flare')}>
              Learn More
            </button>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🌌</span>
              <span className={`impact-status ${auroraStatusClass}`}>{auroraStatus}</span>
            </div>
            <h3>Aurora Possibility</h3>
            <p>{auroraDesc}</p>
            <div className="impact-meter">
              <div
                className="impact-meter-fill"
                style={{ width: `${auroraChance}%`, background: auroraColor }}
              />
            </div>
            <span className="impact-meter-label">Aurora chance: {auroraChance}%</span>
            <button className="learn-more-btn" onClick={() => learnMore.search('Aurora')}>
              Learn More
            </button>
          </div>

          <div className="impact-card">
            <div className="impact-card-top">
              <span className="impact-icon">🔆</span>
              <span className={`impact-status ${flareStatusClass}`}>{flareLevel}</span>
            </div>
            <h3>Solar Flare Activity</h3>
            <p>{space.loading ? 'Fetching data...' : flareDesc}</p>
          </div>
        </div>
      </section>

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
