import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import Header from '../components/ui/curved-menu'
import Footer from '../components/Footer'
import MagicBento from '../components/MagicBento'
import SatelliteScrollAnimation from '../components/SatelliteScrollAnimation'
import TextShowcaseSection from '../components/TextShowcaseSection'
import { AnimatedTeamSection } from '../components/ui/team-section'
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack'
import GradualBlur from '../components/GradualBlur'
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

    // ── Parallax & reveal animations (all visible by default) ──
    gsap.from('.feature-card', {
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    gsap.utils.toArray<HTMLElement>('.section-header').forEach((header) => {
      gsap.from(header, {
        y: 30,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      })
    })

    gsap.from('.step-card', {
      y: 30,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.steps-grid',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    gsap.from('.about-text', {
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })

    gsap.from('.cta-banner', {
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cta-banner',
        start: 'top 85%',
        toggleActions: 'play none none none',
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
      {/* 3D Satellite scroll animation overlay */}
      <SatelliteScrollAnimation />

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

        {/* ── Spacer to push text section down ── */}
        <div style={{ height: '70vh' }} />

        {/* ── Text Showcase Section (3-effect animation) ── */}
        <TextShowcaseSection />

        {/* ── Magic Bento Feature Cards ── */}
        <section className="glowing-features-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c084fc', marginBottom: '0.75rem' }}>✨ Features</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', marginBottom: '0.75rem' }}>Explore the Cosmos Like Never Before</h2>
            <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Discover powerful tools designed to bring the wonders of space closer to you.</p>
          </div>
          <MagicBento
            textAutoHide={true}
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            enableTilt
            enableMagnetism
            clickEffect
            spotlightRadius={550}
            particleCount={12}
            glowColor="132, 0, 255"
            disableAnimations={false}
          />
        </section>

        {/* ── Team ── */}
        <AnimatedTeamSection
          title="Meet Our Team"
          description="Alma Malditas, SR-05 — The people behind AstroView, building your window to the cosmos."
          members={[
            { name: "Manas Mungekar", emoji: "🛰️" },
            { name: "Ved Motwani", emoji: "🔭" },
            { name: "Yash Sharma", emoji: "🌌" },
            { name: "Vaibhav Kankonkar", emoji: "🚀" },
          ]}
        />

        {/* ── Why AstroView ── */}
        <section className="why-astroview-section">
          <div className="section-header">
            <span className="section-badge">✨ Why AstroView</span>
            <h2 className="section-title">Why AstroView?</h2>
            <p className="section-subtitle">
              Everything you need to explore the cosmos — simplified, personalized, and real-time.
            </p>
          </div>
        </section>
        <ScrollStack
          itemDistance={80}
          itemStackDistance={20}
          baseScale={0.9}
          className="astro-scroll-stack"
        >
          <ScrollStackItem itemClassName="astro-card">
            <span className="card-icon">🛰️</span>
            <span className="card-stat">24/7</span>
            <h3 className="card-title">Live Space Monitoring</h3>
            <p className="card-description">
              Real-time data streams from NASA, the ISS, and global weather APIs —
              monitored around the clock so you never miss a cosmic event.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="astro-card">
            <span className="card-icon">📡</span>
            <span className="card-stat">5+</span>
            <h3 className="card-title">Data Sources Aggregated</h3>
            <p className="card-description">
              We pull from dozens of scattered, technical sources and consolidate
              everything into one clean dashboard. No more tab-hopping.
            </p>
          </ScrollStackItem>
          <ScrollStackItem itemClassName="astro-card">
            <span className="card-icon">📍</span>
            <span className="card-stat">100%</span>
            <h3 className="card-title">Location-Personalized</h3>
            <p className="card-description">
              Every data point is localized to your exact coordinates — visibility scores,
              pass predictions, and alerts tailored to where you are. No PhD required.
            </p>
          </ScrollStackItem>
        </ScrollStack>


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

      {/* ── Page-level gradual blur at the bottom ── */}
      <GradualBlur
        target="page"
        position="bottom"
        height="7rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
      />
    </div>
  )
}
