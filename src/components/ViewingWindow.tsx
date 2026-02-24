import type { ViewingWindow } from '../services/viewingEngine'
import './ViewingWindow.css'

interface Props {
    window: ViewingWindow | null
    loading: boolean
}

export default function ViewingWindowCard({ window: vw, loading }: Props) {
    if (loading) {
        return (
            <div className="vw-card">
                <div className="vw-header">
                    <span className="vw-icon">🔭</span>
                    <h3>Best Viewing Window</h3>
                </div>
                <p className="vw-analyzing">Analyzing sky conditions...</p>
            </div>
        )
    }

    if (!vw || !vw.found) {
        return (
            <div className="vw-card vw-poor">
                <div className="vw-header">
                    <span className="vw-icon">🔭</span>
                    <h3>Best Viewing Window</h3>
                </div>
                <div className="vw-no-window">
                    <span className="vw-no-icon">☁️</span>
                    <p>{vw?.reason || 'No suitable viewing window found tonight'}</p>
                </div>
                <div className="vw-quality-row">
                    <span>Quality Score</span>
                    <strong style={{ color: '#FF4C4C' }}>{vw?.qualityScore ?? 0}/100</strong>
                </div>
            </div>
        )
    }

    const qualityColor =
        vw.qualityScore >= 80 ? '#00FF88' :
            vw.qualityScore >= 60 ? '#00F5FF' :
                vw.qualityScore >= 40 ? '#FFB800' : '#FF4C4C'

    return (
        <div className="vw-card vw-found">
            <div className="vw-header">
                <span className="vw-icon">🔭</span>
                <h3>Best Viewing Window</h3>
            </div>

            <div className="vw-time-display">
                <span className="vw-time">{vw.bestStartTime}</span>
                <span className="vw-separator">→</span>
                <span className="vw-time">{vw.bestEndTime}</span>
            </div>

            <div className="vw-quality-row">
                <span>Quality Score</span>
                <strong style={{ color: qualityColor }}>{vw.qualityScore}/100</strong>
            </div>

            <div className="vw-quality-bar">
                <div
                    className="vw-quality-fill"
                    style={{ width: `${vw.qualityScore}%`, background: qualityColor }}
                />
            </div>

            <p className="vw-reason">{vw.reason}</p>
        </div>
    )
}
