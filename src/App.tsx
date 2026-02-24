import { Routes, Route } from 'react-router-dom'
import './App.css'

import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SkyEvents from './pages/SkyEvents'
import SpaceImpact from './pages/SpaceImpact'
import LiveTracker from './pages/LiveTracker'
import ConstellationGame from './pages/ConstellationGame'
import Profile from './pages/Profile'
import TimelinePage from './pages/TimelinePage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes — no authentication required */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes — require valid JWT */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sky-events" element={<SkyEvents />} />
        <Route path="/space-impact" element={<SpaceImpact />} />
        <Route path="/live-tracker" element={<LiveTracker />} />
        <Route path="/constellation-game" element={<ConstellationGame />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Route>
    </Routes>
  )
}

export default App
