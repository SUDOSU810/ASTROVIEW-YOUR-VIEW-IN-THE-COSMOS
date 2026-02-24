import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// ── Types ──
interface UserData {
    _id: string
    name: string
    email: string
    role: string
    location: {
        latitude: number | null
        longitude: number | null
        city: string
        country: string
    }
    preferences: {
        notifyISS: boolean
        notifySolar: boolean
        notifyDisaster: boolean
    }
}

interface AuthContextType {
    user: UserData | null
    token: string | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (data: SignupData) => Promise<void>
    logout: () => void
}

interface SignupData {
    name: string
    email: string
    password: string
    role?: string
    location?: {
        latitude?: number
        longitude?: number
        city?: string
        country?: string
    }
}

// ── Context ──
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // On mount, restore token & user from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('astroview_token')
        const storedUser = localStorage.getItem('astroview_user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Login failed')
        }

        localStorage.setItem('astroview_token', data.token)
        localStorage.setItem('astroview_user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
    }

    const signup = async (signupData: SignupData) => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData),
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || 'Signup failed')
        }

        localStorage.setItem('astroview_token', data.token)
        localStorage.setItem('astroview_user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
    }

    const logout = () => {
        localStorage.removeItem('astroview_token')
        localStorage.removeItem('astroview_user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                loading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// ── Hook ──
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
