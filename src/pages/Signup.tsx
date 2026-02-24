import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Signup() {
    const navigate = useNavigate()
    const { signup } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('student')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signup({
                name,
                email,
                password,
                role,
                location: {
                    city: city || undefined,
                    country: country || undefined,
                },
            })
            navigate('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <span>🚀</span>
                </div>
                <h1 className="auth-title">Join AstroView</h1>
                <p className="auth-subtitle">Create your account and explore the cosmos</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-email">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">I am a…</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">🎓 Student</option>
                            <option value="farmer">🌾 Farmer</option>
                            <option value="astronomy_enthusiast">🔭 Astronomy Enthusiast</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City (optional)</label>
                            <input
                                id="city"
                                type="text"
                                placeholder="Mumbai"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                autoComplete="address-level2"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="country">Country (optional)</label>
                            <input
                                id="country"
                                type="text"
                                placeholder="India"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                autoComplete="country-name"
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
