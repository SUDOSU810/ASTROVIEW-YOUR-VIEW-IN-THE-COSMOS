import type { NasaLibraryItem } from '../services/nasaLibrary'
import './LearnMoreModal.css'

interface Props {
    isOpen: boolean
    topic: string
    items: NasaLibraryItem[]
    loading: boolean
    error: string | null
    onClose: () => void
}

export default function LearnMoreModal({ isOpen, topic, items, loading, error, onClose }: Props) {
    if (!isOpen) return null

    return (
        <div className="lm-overlay" onClick={onClose}>
            <div className="lm-modal" onClick={(e) => e.stopPropagation()}>
                <button className="lm-close" onClick={onClose}>✕</button>

                <div className="lm-header">
                    <h2>🔭 Learn More: {topic}</h2>
                </div>

                {loading && (
                    <div className="lm-loading">
                        <div className="lm-spinner" />
                        Searching NASA archives...
                    </div>
                )}

                {error && (
                    <div className="lm-error">Failed to load: {error}</div>
                )}

                {!loading && items.length > 0 && (
                    <>
                        {/* Why It Matters */}
                        <div className="lm-why">
                            <h3>💡 Why This Matters</h3>
                            <p>{items[0].whyItMatters}</p>
                        </div>

                        {/* Image Grid */}
                        <div className="lm-grid">
                            {items.map((item, i) => (
                                <div key={i} className="lm-card">
                                    <img src={item.imageUrl} alt={item.title} className="lm-img" />
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                    <span className="lm-meta">{item.center} · {item.dateCreated}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && items.length === 0 && !error && (
                    <div className="lm-empty">No images found for "{topic}"</div>
                )}
            </div>
        </div>
    )
}
