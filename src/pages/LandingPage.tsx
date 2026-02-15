import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import Header from '../components/ui/curved-menu'
import Footer from '../components/Footer'
import { GlowingFeatureCards } from '../components/GlowingFeatureCards'
import './LandingPage.css'
import heroVideo from '../assets/astroview_hero.mp4'
import eliteVideo from '../assets/astroview_elite - Made with Clipchamp.mp4'
import cosmicBloom from '../assets/cosmic_bloom_remix.webm'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const eliteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // ── Lenis smooth scroll ──
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ── Hero video fades out on scroll ──
    gsap.to('.hero-video-section', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-video-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // ── Elite video: start paused, play when hero scrolls off ──
    const eliteVid = eliteVideoRef.current
    if (eliteVid) {
      eliteVid.pause()

      ScrollTrigger.create({
        trigger: '.hero-video-section',
        start: 'bottom top',
        onEnter: () => {
          gsap.to('.elite-video-wrapper', { opacity: 1, duration: 0.8 })
          eliteVid.play()
        },
        onLeaveBack: () => {
          gsap.to('.elite-video-wrapper', { opacity: 0, duration: 0.5 })
          eliteVid.pause()
        },
      })

      // Fade out elite video earlier (before reaching footer)
      ScrollTrigger.create({
        trigger: '.cta-banner',
        start: 'top bottom', // Start fading when CTA enters viewport
        end: 'center center', // Fully gone when CTA is centered
        scrub: true,
        onUpdate: (self) => {
          gsap.set('.elite-video-wrapper', { opacity: 1 - self.progress })
        },
      })
    }

    // ── Parallax & reveal animations ──
    gsap.from('.feature-card', {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.utils.toArray<HTMLElement>('.section-header').forEach((header) => {
      gsap.from(header, {
        y: 60,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    gsap.from('.step-card', {
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.steps-grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.from('.about-text', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.from('.cta-banner', {
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cta-banner',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })

    gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-speed') || '1')
      gsap.to(el, {
        y: () => (1 - speed) * 200,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
      lenis.destroy()
    }
  }, [])

  return (
    <div className="landing">
      {/* Get Started button — top-left, links to login */}
      <Link
        to="/login"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 100,
          padding: '0.6rem 1.6rem',
          background: 'rgba(15, 18, 30, 0.85)',
          backdropFilter: 'blur(12px)',
          color: '#e2e8f0',
          borderRadius: '999px',
          fontWeight: 600,
          fontSize: '0.9rem',
          textDecoration: 'none',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(25, 30, 50, 0.95)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(15, 18, 30, 0.85)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }}
      >
        Get Started
      </Link>

      {/* Curved hamburger menu */}
      <Header />

      {/* ───── SECTION 1: Looping hero video (fades on scroll) ───── */}
      <section className="hero-video-section">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="video-bg"
        />
        <div className="video-edge-top" />
        <div className="video-edge-bottom" />
        <div className="video-edge-left" />
        <div className="video-edge-right" />
      </section>

      {/* ───── PERSISTENT ELITE VIDEO BACKGROUND (stays until footer) ───── */}
      <div className="elite-video-wrapper">
        <video
          ref={eliteVideoRef}
          src={eliteVideo}
          loop
          muted
          playsInline
          preload="auto"
          className="video-bg"
        />
        <div className="elite-video-overlay" />
        <div className="video-edge-top" />
        <div className="video-edge-bottom" />
        <div className="video-edge-left" />
        <div className="video-edge-right" />
      </div>

      {/* ───── Content sections float over elite video ───── */}
      <div className="landing-content">

        {/* ── Text restored as it was before (Hero style) ── */}
        <section className="hero">
          <div className="hero-overlay">
            <div className="hero-center" data-speed="0.9" style={{ paddingTop: '4rem' }}>
              <span className="hero-badge">🛰️ Space Intelligence Platform</span>
              <h2 className="hero-heading">
                See Space. <em>Understand Impact.</em>
              </h2>
              <p className="hero-description">
                Real-time celestial events, ISS tracking, sky visibility scores,
                and actionable space insights — all localized to your location and
                simplified for everyone.
              </p>
              <div className="hero-cta">
                <Link to="/dashboard" className="btn-primary">
                  Explore Now
                </Link>
                <Link to="/sky-events" className="btn-secondary">
                  View Tonight's Sky
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Glowing Feature Cards ── */}
        <GlowingFeatureCards />

        {/* ── What is AstroView ── */}
        <section className="about-section">
          <div className="about-text" data-speed="0.92">
            <h2 className="section-title">What is AstroView?</h2>
            <p className="about-paragraph">
              AstroView is your intelligent window to the cosmos — a space
              intelligence platform that transforms complex astronomical data
              into clear, actionable insights. Whether you're a seasoned
              stargazer or just curious about what's happening above, AstroView
              brings real-time space information right to your fingertips.
            </p>
            <p className="about-paragraph">
              We aggregate live data from NASA, the International Space Station,
              weather services, and astronomical databases to give you a
              personalized view of the universe — all localized to your exact
              location on Earth.
            </p>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features" id="features">
          <div className="section-header" data-speed="0.9">
            <span className="section-badge">✨ Core Features</span>
            <h2 className="section-title">Everything you need to explore space</h2>
            <p className="section-subtitle">
              From live satellite tracking to personalized sky alerts — AstroView
              brings the cosmos to you.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card" data-speed="0.85">
              <div className="feature-icon">🌠</div>
              <h3>Sky Alerts</h3>
              <p>
                Get notified about meteor showers, eclipses, and other celestial
                events visible from your location.
              </p>
            </div>
            <div className="feature-card" data-speed="0.9">
              <div className="feature-icon">🛰</div>
              <h3>ISS Tracking</h3>
              <p>
                Track the International Space Station in real-time and know
                exactly when it passes above you.
              </p>
            </div>
            <div className="feature-card" data-speed="0.85">
              <div className="feature-icon">🌍</div>
              <h3>Space Impact</h3>
              <p>
                Understand how solar activity, asteroids, and space weather
                affect daily life on Earth.
              </p>
            </div>
            <div className="feature-card" data-speed="0.9">
              <div className="feature-icon">🎓</div>
              <h3>Learn Space Simply</h3>
              <p>
                Complex astronomy data translated into clear, beginner-friendly
                insights anyone can understand.
              </p>
            </div>
          </div>
        </section>

        {/* ── Why AstroView ── */}
        <section className="about-section">
          <div className="about-text" data-speed="0.9">
            <h2 className="section-title">Why AstroView?</h2>
            <div className="about-stats">
              <div className="about-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Live Space Monitoring</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">5+</span>
                <span className="stat-label">Data Sources Aggregated</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Location-Personalized</span>
              </div>
            </div>
            <p className="about-paragraph">
              Most space data is buried in technical jargon and scattered across
              dozens of sources. AstroView brings it all together, simplifies
              the complexity, and delivers what matters — directly to you.
              No PhD required.
            </p>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="how-it-works" id="how-it-works">
          <div className="section-header" data-speed="0.9">
            <span className="section-badge">⚡ How It Works</span>
            <h2 className="section-title">From data to discovery in seconds</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card" data-speed="0.85">
              <div className="step-number">01</div>
              <div className="step-icon">📍</div>
              <h3>Detect Location</h3>
              <p>We pinpoint your geographic coordinates to localize all space data.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card" data-speed="0.9">
              <div className="step-number">02</div>
              <div className="step-icon">📡</div>
              <h3>Fetch Space Data</h3>
              <p>Live data from NASA, ISS, and weather APIs is aggregated in real-time.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card" data-speed="0.85">
              <div className="step-number">03</div>
              <div className="step-icon">🧠</div>
              <h3>Analyze &amp; Simplify</h3>
              <p>Complex metrics are processed into clear visibility scores and alerts.</p>
            </div>
            <div className="step-connector" />
            <div className="step-card" data-speed="0.9">
              <div className="step-number">04</div>
              <div className="step-icon">🚀</div>
              <h3>Deliver Insight</h3>
              <p>You get personalized sky info, event notifications, and impact analysis.</p>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="cta-banner">
          <h2>Ready to explore the cosmos?</h2>
          <p>Your personalized space intelligence dashboard is one click away.</p>
          <Link to="/dashboard" className="btn-primary btn-lg">
            Launch Dashboard →
          </Link>
        </section>
      </div>

      {/* ───── Footer with cosmic bloom video ───── */}
      <div className="footer-video-section">
        <div className="footer-video-bg">
          <video
            src={cosmicBloom}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="video-bg"
          />
          <div className="footer-video-overlay" />
        </div>
        <Footer />
      </div>
    </div>
  )
}
