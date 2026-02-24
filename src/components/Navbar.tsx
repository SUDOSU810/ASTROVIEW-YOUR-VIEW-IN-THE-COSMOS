import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="app-nav">
      <NavLink to="/" className="app-nav-brand">
        <span className="brand-dot" />
        AstroView
      </NavLink>

      <div className="app-nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/sky-events">Sky Events</NavLink>
        <NavLink to="/space-impact">Space Impact</NavLink>
        <NavLink to="/live-tracker">Live Tracker</NavLink>
        <NavLink to="/constellation-game">Polaris</NavLink>
        <NavLink to="/timeline">Timeline</NavLink>
      </div>
    </nav>
  )
}
