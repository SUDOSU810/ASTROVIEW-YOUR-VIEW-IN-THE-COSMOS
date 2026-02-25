import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './TextShowcaseSection.css'

gsap.registerPlugin(ScrollTrigger)

// ── Content ──
const PARA_LEFT =
    "That's where it all begins — the feeling you get when you look up at the night sky and realize how big everything is. This website was born from that same curiosity, the urge to ask questions and truly understand what's happening above us in a way that feels exciting and real."

const PARA_RIGHT =
    "shouldn't feel distant or complicated. It should feel inspiring. This is a place for dreamers and explorers at heart — for anyone who still looks at the stars and thinks, \"What's out there?\""

// ═══════════════════════════════════════
// Horizontal Word Reveal
// True implementation: translateX from off-screen,
// per-character brightness based on viewport position
// ═══════════════════════════════════════
function HorizontalRevealWord({
    word,
    scrollStart,
    scrollEnd,
    sectionRef,
}: {
    word: string
    scrollStart: number
    scrollEnd: number
    sectionRef: React.RefObject<HTMLDivElement | null>
}) {
    const wordRef = useRef<HTMLSpanElement>(null)
    const charsRef = useRef<HTMLSpanElement[]>([])

    useEffect(() => {
        if (!wordRef.current || !sectionRef.current) return

        // Split into individual chars
        const chars: HTMLSpanElement[] = []
        wordRef.current.innerHTML = ''
        for (const ch of word) {
            const span = document.createElement('span')
            span.textContent = ch
            span.style.display = 'inline-block'
            span.style.opacity = '0.30'
            // Inherit background gradient
            span.style.background = 'inherit'
            span.style.webkitBackgroundClip = 'text'
            span.style.backgroundClip = 'text'
            span.style.webkitTextFillColor = 'transparent'
            wordRef.current.appendChild(span)
            chars.push(span)
        }
        charsRef.current = chars

        // Set initial: far off-screen right with wide letter spacing
        gsap.set(wordRef.current, { x: '110vw', letterSpacing: '6vw' })

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: `${scrollStart * 100}% top`,
                    end: `${scrollEnd * 100}% top`,
                    scrub: 0.5,
                },
            })

            // Slide in + collapse letter spacing
            tl.to(wordRef.current, {
                x: 0,
                letterSpacing: '-0.02em',
                duration: 1,
                ease: 'power2.out',
            })
        })

        // Separate scroll listener for per-char brightness (not on timeline)
        const updateBrightness = () => {
            const vw = window.innerWidth
            charsRef.current.forEach((s) => {
                const rect = s.getBoundingClientRect()
                const xf = rect.left / vw
                let alpha: number
                if (xf <= 0.35) alpha = 1.0
                else alpha = 1.0 - ((xf - 0.35) / 0.30) * 0.70
                s.style.opacity = Math.max(0.30, alpha).toFixed(3)
            })
        }

        window.addEventListener('scroll', updateBrightness, { passive: true })
        updateBrightness()

        return () => {
            ctx.revert()
            window.removeEventListener('scroll', updateBrightness)
        }
    }, [word, scrollStart, scrollEnd, sectionRef])

    return (
        <div className="horizontal-reveal-container">
            <span ref={wordRef} className="horizontal-reveal-word">
                {word}
            </span>
        </div>
    )
}

// ═══════════════════════════════════════
// Block Reveal Text — truly line-by-line, sequential
// Each line gets its own scroll window
// ═══════════════════════════════════════
function BlockRevealText({
    text,
    scrollStart,
    scrollEnd,
    blockColor = '#4a9eff',
    sectionRef,
}: {
    text: string
    scrollStart: number
    scrollEnd: number
    blockColor?: string
    sectionRef: React.RefObject<HTMLDivElement | null>
}) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current || !sectionRef.current) return
        const el = containerRef.current

        // Build span-per-word to measure line breaks
        el.innerHTML = ''
        const words = text.split(' ')
        const wordSpans: HTMLSpanElement[] = []

        words.forEach((w, i) => {
            const span = document.createElement('span')
            span.textContent = w + (i < words.length - 1 ? ' ' : '')
            span.style.display = 'inline'
            span.style.font = 'inherit'
            span.style.lineHeight = 'inherit'
            span.style.color = 'inherit'
            el.appendChild(span)
            wordSpans.push(span)
        })

        // Group words into lines by offsetTop
        const lines: string[] = []
        let currentLine = ''
        let currentTop = wordSpans[0]?.offsetTop ?? 0

        wordSpans.forEach((span) => {
            if (Math.abs(span.offsetTop - currentTop) > 2) {
                lines.push(currentLine.trim())
                currentLine = span.textContent || ''
                currentTop = span.offsetTop
            } else {
                currentLine += span.textContent || ''
            }
        })
        if (currentLine.trim()) lines.push(currentLine.trim())

        // Rebuild with wrapper + block revealer per line
        el.innerHTML = ''
        const lineEls: HTMLDivElement[] = []
        const blockEls: HTMLDivElement[] = []

        lines.forEach((lineText) => {
            const wrapper = document.createElement('div')
            wrapper.className = 'block-reveal-line-wrapper'

            const lineDiv = document.createElement('div')
            lineDiv.className = 'block-reveal-line'
            lineDiv.textContent = lineText

            const block = document.createElement('div')
            block.className = 'block-reveal-block'
            block.style.backgroundColor = blockColor

            wrapper.appendChild(lineDiv)
            wrapper.appendChild(block)
            el.appendChild(wrapper)

            lineEls.push(lineDiv)
            blockEls.push(block)
        })

        // Animate each line sequentially — each gets its own scroll slice
        const totalLines = lines.length
        const scrollRange = scrollEnd - scrollStart
        const lineWindow = scrollRange / totalLines

        const ctx = gsap.context(() => {
            lineEls.forEach((lineEl, i) => {
                const lineStart = scrollStart + i * lineWindow
                const lineEnd = lineStart + lineWindow

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: `${lineStart * 100}% top`,
                        end: `${lineEnd * 100}% top`,
                        scrub: 0.4,
                    },
                })

                // Block expands
                tl.to(blockEls[i], {
                    scaleX: 1,
                    duration: 0.4,
                    transformOrigin: 'left center',
                    ease: 'expo.inOut',
                })
                    // Text appears
                    .set(lineEl, { opacity: 1 }, 0.25)
                    // Block exits
                    .to(
                        blockEls[i],
                        {
                            scaleX: 0,
                            duration: 0.4,
                            transformOrigin: 'right center',
                            ease: 'expo.inOut',
                        },
                        0.3
                    )
            })
        })

        return () => ctx.revert()
    }, [text, scrollStart, scrollEnd, blockColor, sectionRef])

    return (
        <div
            ref={containerRef}
            className="block-reveal-container"
            style={{
                font: "300 clamp(1.15rem, 1.6vw, 1.5rem)/2.0 'Cormorant Garamond', Georgia, serif",
                color: '#c0ccdd',
            }}
        />
    )
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════
export default function TextShowcaseSection() {
    const sectionRef = useRef<HTMLDivElement>(null)

    return (
        <div className="text-showcase-section" ref={sectionRef}>
            <div className="text-showcase-sticky">
                <div className="text-showcase-inner">
                    {/* ── Block 1: Left-aligned ── */}
                    <div className="ts-block-left">
                        <span className="text-showcase-label">Our Story</span>

                        {/* "Wonder." — horizontal reveal (0%–18% of section scroll) */}
                        <HorizontalRevealWord
                            word="Wonder."
                            scrollStart={0.02}
                            scrollEnd={0.18}
                            sectionRef={sectionRef}
                        />

                        {/* Paragraph body — block reveal line by line (18%–40%) */}
                        <BlockRevealText
                            text={PARA_LEFT}
                            scrollStart={0.18}
                            scrollEnd={0.42}
                            blockColor="#4a9eff"
                            sectionRef={sectionRef}
                        />
                    </div>

                    {/* ── Horizontal Divider ── */}
                    <div className="text-showcase-divider-h" />

                    {/* ── Block 2: Right-aligned ── */}
                    <div className="ts-block-right">
                        <span className="text-showcase-label">Our Vision</span>

                        {/* "Space" — horizontal reveal (50%–66%) */}
                        <HorizontalRevealWord
                            word="Space"
                            scrollStart={0.50}
                            scrollEnd={0.66}
                            sectionRef={sectionRef}
                        />

                        {/* Paragraph body — block reveal line by line (66%–88%) */}
                        <BlockRevealText
                            text={PARA_RIGHT}
                            scrollStart={0.66}
                            scrollEnd={0.88}
                            blockColor="#a78bfa"
                            sectionRef={sectionRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
