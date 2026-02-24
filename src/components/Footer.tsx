import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-logo">
            <span className="brand-dot" />
            AstroView
          </span>
          <p className="footer-tagline">
            Your intelligent window to the cosmos. Real-time space data,
            simplified for everyone.
          </p>
        </div>

        {/* Links */}
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/sky-events">Sky Events</Link>
          <Link to="/space-impact">Space Impact</Link>
          <Link to="/live-tracker">Live Tracker</Link>
        </div>

        <div className="footer-col">
          <h4>APIs Used</h4>
          <a href="https://api.nasa.gov" target="_blank" rel="noreferrer">NASA Open APIs</a>
          <a href="http://open-notify.org" target="_blank" rel="noreferrer">Open Notify (ISS)</a>
          <a href="https://openweathermap.org" target="_blank" rel="noreferrer">OpenWeather</a>
          <a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet Maps</a>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <span>Built for Hackathon 2026</span>
          <span>Space Intelligence Platform</span>
          <span>Educational Purpose</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 AstroView · Built with NASA, Weather &amp; Open Notify APIs</span>
        <span className="footer-version">v1.0</span>
      </div>
    </footer>
  )
}
