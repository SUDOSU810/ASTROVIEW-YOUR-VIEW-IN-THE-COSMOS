import { useState } from 'react'
import { Timeline } from '../components/ui/timeline'
import { fetch2025TimelineEvents, type TimelineEvent } from '../services/timelineApi'
import './Timeline.css'

const EVENT_ICONS: Record<string, string> = {
    solar_flare: '☀️',
    cme: '💥',
    geomagnetic_storm: '🌌',
    asteroid: '☄️',
    solar_energetic_particle: '⚡',
    eclipse: '🌑',
    meteor_shower: '🌠',
    mission: '🚀',
    conjunction: '🪐',
}

const EVENT_LABELS: Record<string, string> = {
    solar_flare: 'Solar Flare',
    cme: 'Coronal Mass Ejection',
    geomagnetic_storm: 'Geomagnetic Storm',
    asteroid: 'Near-Earth Asteroid',
    solar_energetic_particle: 'Solar Particle Event',
    eclipse: 'Eclipse',
    meteor_shower: 'Meteor Shower',
    mission: 'Space Mission',
    conjunction: 'Planetary Event',
}

function EventCard({ event }: { event: TimelineEvent }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="timeline-event-card">
            <span className={`timeline-event-badge ${event.type}`}>
                {EVENT_ICONS[event.type]} {EVENT_LABELS[event.type] || event.type}
            </span>

            <h4 className="timeline-event-title">{event.title}</h4>

            <p className="timeline-event-date">
                {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
            </p>

            <div className="severity-indicator">
                <span className={`severity-dot ${event.severity}`} />
                <span className={`severity-text ${event.severity}`}>
                    {event.severity} severity
                </span>
            </div>

            <p className="timeline-event-summary">{event.summary}</p>

            <button
                className="read-more-btn"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? '▲ Less' : '▼ Read More'}
            </button>

            {expanded && (
                <div className="read-more-details">
                    {event.details}
                    <div className="read-more-source">
                        <span>Source: {event.source}</span>
                        {event.link && (
                            <a href={event.link} target="_blank" rel="noopener noreferrer">
                                View Source →
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// Load events immediately (no API, instant)
const ALL_EVENTS = fetch2025TimelineEvents()

export default function TimelinePage() {
    // Group events by month
    const monthGroups = new Map<string, TimelineEvent[]>()
    for (const event of ALL_EVENTS) {
        const d = new Date(event.date)
        const key = `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`
        if (!monthGroups.has(key)) monthGroups.set(key, [])
        monthGroups.get(key)!.push(event)
    }

    const timelineData = Array.from(monthGroups.entries()).map(([month, monthEvents]) => ({
        title: month,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1rem' }}>
                {monthEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        ),
    }))

    // Count stats
    const stats = {
        total: ALL_EVENTS.length,
        storms: ALL_EVENTS.filter(e => e.type === 'geomagnetic_storm' || e.type === 'solar_flare').length,
        eclipses: ALL_EVENTS.filter(e => e.type === 'eclipse').length,
        meteors: ALL_EVENTS.filter(e => e.type === 'meteor_shower').length,
        missions: ALL_EVENTS.filter(e => e.type === 'mission').length,
        asteroids: ALL_EVENTS.filter(e => e.type === 'asteroid').length,
    }

    return (
        <div className="timeline-page">
            <div className="timeline-header">
                <h1>Space Events <span>2025</span></h1>
                <p>
                    A curated timeline of major space weather events, eclipses, meteor showers,
                    asteroid encounters, and missions that defined 2025 — sourced from NASA, NOAA, and ESA.
                </p>
            </div>

            <div className="timeline-stats">
                <div className="timeline-stat">
                    <strong>{stats.total}</strong> Events
                </div>
                <div className="timeline-stat">
                    🌌 <strong>{stats.storms}</strong> Storms & Flares
                </div>
                <div className="timeline-stat">
                    🌑 <strong>{stats.eclipses}</strong> Eclipses
                </div>
                <div className="timeline-stat">
                    🌠 <strong>{stats.meteors}</strong> Meteor Showers
                </div>
                <div className="timeline-stat">
                    🚀 <strong>{stats.missions}</strong> Missions
                </div>
                <div className="timeline-stat">
                    ☄️ <strong>{stats.asteroids}</strong> Asteroids
                </div>
            </div>

            <Timeline data={timelineData} />
        </div>
    )
}
