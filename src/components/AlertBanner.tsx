import type { Alert } from '../services/alertEngine'
import './AlertBanner.css'

interface Props {
    alerts: Alert[]
    loading: boolean
}

export default function AlertBanner({ alerts, loading }: Props) {
    if (loading || alerts.length === 0) return null

    return (
        <div className="alert-banner">
            <div className="alert-banner-header">
                <span className="alert-banner-icon">🚨</span>
                <span className="alert-banner-title">Active Alerts ({alerts.length})</span>
            </div>
            <div className="alert-list">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`alert-card alert-${alert.severity}`}
                    >
                        <div className="alert-card-top">
                            <span className="alert-card-icon">{alert.icon}</span>
                            <span className={`alert-severity-badge severity-${alert.severity}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                        </div>
                        <h4 className="alert-card-title">{alert.title}</h4>
                        <p className="alert-card-message">{alert.message}</p>
                        <span className="alert-card-timeframe">⏰ {alert.timeframe}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
