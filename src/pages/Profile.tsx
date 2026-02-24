import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

export default function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    if (!user) return null

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <h1 className="profile-name">{user.name}</h1>
                <span className="profile-role">{user.role?.replace('_', ' ') || 'Explorer'}</span>
                <p className="profile-email">{user.email}</p>

                <div className="profile-details">
                    {user.location?.city && (
                        <div className="profile-detail-row">
                            <span className="profile-label">📍 Location</span>
                            <span className="profile-value">
                                {user.location.city}{user.location.country ? `, ${user.location.country}` : ''}
                            </span>
                        </div>
                    )}
                    <div className="profile-detail-row">
                        <span className="profile-label">🔔 ISS Alerts</span>
                        <span className="profile-value">{user.preferences?.issAlerts ? 'On' : 'Off'}</span>
                    </div>
                    <div className="profile-detail-row">
                        <span className="profile-label">☀️ Solar Alerts</span>
                        <span className="profile-value">{user.preferences?.solarAlerts ? 'On' : 'Off'}</span>
                    </div>
                    <div className="profile-detail-row">
                        <span className="profile-label">🌪️ Disaster Alerts</span>
                        <span className="profile-value">{user.preferences?.disasterAlerts ? 'On' : 'Off'}</span>
                    </div>
                </div>

                <button className="profile-logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    )
}
