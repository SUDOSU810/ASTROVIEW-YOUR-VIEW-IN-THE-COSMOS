import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { Rocket, Globe, Eye, Satellite, Sun, Gamepad2 } from 'lucide-react';
import './MagicBento.css';

export interface BentoCardProps {
    color?: string;
    title?: string;
    description?: string;
    label?: string;
    icon?: React.ReactNode;
    iconColor?: string;
    heroVisual?: React.ReactNode;
    textAutoHide?: boolean;
    disableAnimations?: boolean;
}

export interface BentoProps {
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    disableAnimations?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    enableTilt?: boolean;
    glowColor?: string;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const cardData: BentoCardProps[] = [
    {
        color: '#060010',
        title: 'Space Intelligence',
        description: 'Live asteroid flybys, solar flares, and cosmic events from NASA and ESA in one unified dashboard.',
        label: 'Intelligence',
        icon: <Rocket className="h-5 w-5" />,
        iconColor: '#c084fc'
    },
    {
        color: '#060010',
        title: 'Personalized Alerts',
        description: 'Location-based tracking for ISS passes and sky events tailored to your exact geographic coordinates.',
        label: 'Personalization',
        icon: <Globe className="h-5 w-5" />,
        iconColor: '#60a5fa'
    },
    {
        color: '#060010',
        title: 'Sky Visibility Score',
        description: 'AI-calculated viewing scores based on localized weather patterns, cloud cover, and light pollution.',
        label: 'Visibility',
        icon: <Eye className="h-5 w-5" />,
        iconColor: '#818cf8',
        heroVisual: (
            <div className="hero-visual hero-visual--visibility">
                <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
                    {/* Atmosphere layers */}
                    <defs>
                        <linearGradient id="atmoGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.05" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
                        </linearGradient>
                    </defs>
                    <rect x="20" y="10" width="160" height="16" rx="4" fill="url(#atmoGrad)" opacity="0.3" />
                    <rect x="20" y="30" width="160" height="16" rx="4" fill="url(#atmoGrad)" opacity="0.5" />
                    <rect x="20" y="50" width="160" height="16" rx="4" fill="url(#atmoGrad)" opacity="0.7" />
                    <rect x="20" y="70" width="160" height="16" rx="4" fill="url(#atmoGrad)" opacity="0.9" />
                    {/* Score bars */}
                    <rect x="24" y="13" width="120" height="10" rx="3" fill="#818cf8" opacity="0.6">
                        <animate attributeName="width" values="80;120;80" dur="4s" repeatCount="indefinite" />
                    </rect>
                    <rect x="24" y="33" width="100" height="10" rx="3" fill="#818cf8" opacity="0.5">
                        <animate attributeName="width" values="100;140;100" dur="5s" repeatCount="indefinite" />
                    </rect>
                    <rect x="24" y="53" width="140" height="10" rx="3" fill="#818cf8" opacity="0.4">
                        <animate attributeName="width" values="140;90;140" dur="3.5s" repeatCount="indefinite" />
                    </rect>
                    <rect x="24" y="73" width="80" height="10" rx="3" fill="#818cf8" opacity="0.3">
                        <animate attributeName="width" values="60;110;60" dur="6s" repeatCount="indefinite" />
                    </rect>
                    {/* Labels */}
                    <text x="24" y="104" fill="#818cf8" fontSize="7" opacity="0.6" fontFamily="monospace">CLOUDS</text>
                    <text x="64" y="104" fill="#818cf8" fontSize="7" opacity="0.6" fontFamily="monospace">LIGHT</text>
                    <text x="100" y="104" fill="#818cf8" fontSize="7" opacity="0.6" fontFamily="monospace">MOON</text>
                    <text x="134" y="104" fill="#818cf8" fontSize="7" opacity="0.6" fontFamily="monospace">CLEAR</text>
                    {/* Score */}
                    <text x="160" y="20" fill="#818cf8" fontSize="12" fontWeight="bold" fontFamily="monospace" opacity="0.8">92%</text>
                </svg>
            </div>
        )
    },
    {
        color: '#060010',
        title: 'Satellite Tracking',
        description: 'Real-time orbits and pass notifications for the ISS and thousands of satellites with 3D visualizations.',
        label: 'Tracking',
        icon: <Satellite className="h-5 w-5" />,
        iconColor: '#22d3ee',
        heroVisual: (
            <div className="hero-visual hero-visual--tracking">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero-svg">
                    {/* Earth */}
                    <circle cx="100" cy="100" r="35" fill="#22d3ee" opacity="0.08" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.3" />
                    <circle cx="100" cy="100" r="25" fill="#22d3ee" opacity="0.05" />
                    {/* Orbit rings */}
                    <ellipse cx="100" cy="100" rx="70" ry="30" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="4 3" transform="rotate(-20 100 100)" />
                    <ellipse cx="100" cy="100" rx="85" ry="45" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 4" transform="rotate(15 100 100)" />
                    <ellipse cx="100" cy="100" rx="60" ry="55" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.15" transform="rotate(-45 100 100)" />
                    {/* Satellite dot on orbit 1 */}
                    <circle r="4" fill="#22d3ee" opacity="0.9">
                        <animateMotion dur="6s" repeatCount="indefinite">
                            <mpath href="#orbit1" />
                        </animateMotion>
                    </circle>
                    <ellipse id="orbit1" cx="100" cy="100" rx="70" ry="30" fill="none" transform="rotate(-20 100 100)" />
                    {/* Satellite dot on orbit 2 */}
                    <circle r="3" fill="#22d3ee" opacity="0.6">
                        <animateMotion dur="9s" repeatCount="indefinite">
                            <mpath href="#orbit2" />
                        </animateMotion>
                    </circle>
                    <ellipse id="orbit2" cx="100" cy="100" rx="85" ry="45" fill="none" transform="rotate(15 100 100)" />
                    {/* Satellite dot on orbit 3 */}
                    <circle r="2.5" fill="#22d3ee" opacity="0.4">
                        <animateMotion dur="12s" repeatCount="indefinite">
                            <mpath href="#orbit3" />
                        </animateMotion>
                    </circle>
                    <ellipse id="orbit3" cx="100" cy="100" rx="60" ry="55" fill="none" transform="rotate(-45 100 100)" />
                    {/* ISS label */}
                    <g opacity="0.7">
                        <text x="100" y="103" fill="#22d3ee" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ISS</text>
                    </g>
                </svg>
            </div>
        )
    },
    {
        color: '#060010',
        title: 'Space Weather',
        description: 'Solar activity tracking and impact analysis for GPS accuracy, radio comms, and aurora visibility.',
        label: 'Weather',
        icon: <Sun className="h-5 w-5" />,
        iconColor: '#fbbf24'
    },
    {
        color: '#060010',
        title: 'Stargazing Game',
        description: 'Master the night sky with quiz-based challenges. Level up your skills and compete on leaderboards.',
        label: 'Gaming',
        icon: <Gamepad2 className="h-5 w-5" />,
        iconColor: '#34d399'
    }
];

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

const calculateSpotlightValues = (radius: number) => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
    const rect = card.getBoundingClientRect();
    const relativeX = ((mouseX - rect.left) / rect.width) * 100;
    const relativeY = ((mouseY - rect.top) / rect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    disableAnimations?: boolean;
    style?: React.CSSProperties;
    particleCount?: number;
    glowColor?: string;
    enableTilt?: boolean;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
}> = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    clickEffect = false,
    enableMagnetism = false
}) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const particlesRef = useRef<HTMLDivElement[]>([]);
        const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
        const isHoveredRef = useRef(false);
        const memoizedParticles = useRef<HTMLDivElement[]>([]);
        const particlesInitialized = useRef(false);
        const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

        const initializeParticles = useCallback(() => {
            if (particlesInitialized.current || !cardRef.current) return;

            const { width, height } = cardRef.current.getBoundingClientRect();
            memoizedParticles.current = Array.from({ length: particleCount }, () =>
                createParticleElement(Math.random() * width, Math.random() * height, glowColor)
            );
            particlesInitialized.current = true;
        }, [particleCount, glowColor]);

        const clearAllParticles = useCallback(() => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
            magnetismAnimationRef.current?.kill();

            particlesRef.current.forEach(particle => {
                gsap.to(particle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'back.in(1.7)',
                    onComplete: () => {
                        particle.parentNode?.removeChild(particle);
                    }
                });
            });
            particlesRef.current = [];
        }, []);

        const animateParticles = useCallback(() => {
            if (!cardRef.current || !isHoveredRef.current) return;

            if (!particlesInitialized.current) {
                initializeParticles();
            }

            memoizedParticles.current.forEach((particle, index) => {
                const timeoutId = setTimeout(() => {
                    if (!isHoveredRef.current || !cardRef.current) return;

                    const clone = particle.cloneNode(true) as HTMLDivElement;
                    cardRef.current.appendChild(clone);
                    particlesRef.current.push(clone);

                    gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

                    gsap.to(clone, {
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: 'none',
                        repeat: -1,
                        yoyo: true
                    });

                    gsap.to(clone, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: 'power2.inOut',
                        repeat: -1,
                        yoyo: true
                    });
                }, index * 100);

                timeoutsRef.current.push(timeoutId);
            });
        }, [initializeParticles]);

        useEffect(() => {
            if (disableAnimations || !cardRef.current) return;

            const element = cardRef.current;

            const handleMouseEnter = () => {
                isHoveredRef.current = true;
                animateParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 5,
                        rotateY: 5,
                        duration: 0.3,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }
            };

            const handleMouseLeave = () => {
                isHoveredRef.current = false;
                clearAllParticles();

                if (enableTilt) {
                    gsap.to(element, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }

                if (enableMagnetism) {
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            const handleMouseMove = (e: MouseEvent) => {
                if (!enableTilt && !enableMagnetism) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                if (enableTilt) {
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;

                    gsap.to(element, {
                        rotateX,
                        rotateY,
                        duration: 0.1,
                        ease: 'power2.out',
                        transformPerspective: 1000
                    });
                }

                if (enableMagnetism) {
                    const magnetX = (x - centerX) * 0.05;
                    const magnetY = (y - centerY) * 0.05;

                    magnetismAnimationRef.current = gsap.to(element, {
                        x: magnetX,
                        y: magnetY,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            const handleClick = (e: MouseEvent) => {
                if (!clickEffect) return;

                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                );

                const ripple = document.createElement('div');
                ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

                element.appendChild(ripple);

                gsap.fromTo(
                    ripple,
                    {
                        scale: 0,
                        opacity: 1
                    },
                    {
                        scale: 1,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove()
                    }
                );
            };

            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('click', handleClick);

            return () => {
                isHoveredRef.current = false;
                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('click', handleClick);
                clearAllParticles();
            };
        }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

        return (
            <div
                ref={cardRef}
                className={`${className} particle-container`}
                style={{ ...style, position: 'relative', overflow: 'hidden' }}
            >
                {children}
            </div>
        );
    };

const GlobalSpotlight: React.FC<{
    gridRef: React.RefObject<HTMLDivElement | null>;
    disableAnimations?: boolean;
    enabled?: boolean;
    spotlightRadius?: number;
    glowColor?: string;
}> = ({
    gridRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR
}) => {
        const spotlightRef = useRef<HTMLDivElement | null>(null);
        const isInsideSection = useRef(false);

        useEffect(() => {
            if (disableAnimations || !gridRef?.current || !enabled) return;

            const spotlight = document.createElement('div');
            spotlight.className = 'global-spotlight';
            spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
            document.body.appendChild(spotlight);
            spotlightRef.current = spotlight;

            const handleMouseMove = (e: MouseEvent) => {
                if (!spotlightRef.current || !gridRef.current) return;

                const section = gridRef.current.closest('.bento-section');
                const rect = section?.getBoundingClientRect();
                const mouseInside =
                    rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

                isInsideSection.current = mouseInside || false;
                const cards = gridRef.current.querySelectorAll('.magic-bento-card');

                if (!mouseInside) {
                    gsap.to(spotlightRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    cards.forEach(card => {
                        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                    });
                    return;
                }

                const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
                let minDistance = Infinity;

                cards.forEach(card => {
                    const cardElement = card as HTMLElement;
                    const cardRect = cardElement.getBoundingClientRect();
                    const centerX = cardRect.left + cardRect.width / 2;
                    const centerY = cardRect.top + cardRect.height / 2;
                    const distance =
                        Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
                    const effectiveDistance = Math.max(0, distance);

                    minDistance = Math.min(minDistance, effectiveDistance);

                    let glowIntensity = 0;
                    if (effectiveDistance <= proximity) {
                        glowIntensity = 1;
                    } else if (effectiveDistance <= fadeDistance) {
                        glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                    }

                    updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
                });

                gsap.to(spotlightRef.current, {
                    left: e.clientX,
                    top: e.clientY,
                    duration: 0.1,
                    ease: 'power2.out'
                });

                const targetOpacity =
                    minDistance <= proximity
                        ? 0.8
                        : minDistance <= fadeDistance
                            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
                            : 0;

                gsap.to(spotlightRef.current, {
                    opacity: targetOpacity,
                    duration: targetOpacity > 0 ? 0.2 : 0.5,
                    ease: 'power2.out'
                });
            };

            const handleMouseLeave = () => {
                isInsideSection.current = false;
                gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
                    (card as HTMLElement).style.setProperty('--glow-intensity', '0');
                });
                if (spotlightRef.current) {
                    gsap.to(spotlightRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseleave', handleMouseLeave);
                spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
            };
        }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

        return null;
    };

const BentoCardGrid: React.FC<{
    children: React.ReactNode;
    gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
    <div className="card-grid bento-section" ref={gridRef}>
        {children}
    </div>
);

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    particleCount = DEFAULT_PARTICLE_COUNT,
    enableTilt = false,
    glowColor = DEFAULT_GLOW_COLOR,
    clickEffect = true,
    enableMagnetism = true
}) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;

    return (
        <>
            {enableSpotlight && (
                <GlobalSpotlight
                    gridRef={gridRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                />
            )}

            <BentoCardGrid gridRef={gridRef}>
                {cardData.map((card, index) => {
                    const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
                    const cardProps = {
                        className: baseClassName,
                        style: {
                            backgroundColor: card.color,
                            '--glow-color': glowColor
                        } as React.CSSProperties
                    };

                    if (enableStars) {
                        return (
                            <ParticleCard
                                key={index}
                                {...cardProps}
                                disableAnimations={shouldDisableAnimations}
                                particleCount={particleCount}
                                glowColor={glowColor}
                                enableTilt={enableTilt}
                                clickEffect={clickEffect}
                                enableMagnetism={enableMagnetism}
                            >
                                <div className="magic-bento-card__header">
                                    <div className="magic-bento-card__icon" style={{ color: card.iconColor, background: `${card.iconColor}18`, border: `1px solid ${card.iconColor}33` }}>
                                        {card.icon}
                                    </div>
                                    <div className="magic-bento-card__label">{card.label}</div>
                                </div>
                                {card.heroVisual && card.heroVisual}
                                <div className="magic-bento-card__content">
                                    <h2 className="magic-bento-card__title">{card.title}</h2>
                                    <p className="magic-bento-card__description">{card.description}</p>
                                </div>
                            </ParticleCard>
                        );
                    }

                    return (
                        <div
                            key={index}
                            {...cardProps}
                            ref={el => {
                                if (!el) return;

                                const handleMouseMove = (e: MouseEvent) => {
                                    if (shouldDisableAnimations) return;

                                    const rect = el.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;
                                    const centerX = rect.width / 2;
                                    const centerY = rect.height / 2;

                                    if (enableTilt) {
                                        const rotateX = ((y - centerY) / centerY) * -10;
                                        const rotateY = ((x - centerX) / centerX) * 10;
                                        gsap.to(el, {
                                            rotateX,
                                            rotateY,
                                            duration: 0.1,
                                            ease: 'power2.out',
                                            transformPerspective: 1000
                                        });
                                    }

                                    if (enableMagnetism) {
                                        const magnetX = (x - centerX) * 0.05;
                                        const magnetY = (y - centerY) * 0.05;
                                        gsap.to(el, {
                                            x: magnetX,
                                            y: magnetY,
                                            duration: 0.3,
                                            ease: 'power2.out'
                                        });
                                    }
                                };

                                const handleMouseLeave = () => {
                                    if (shouldDisableAnimations) return;

                                    if (enableTilt) {
                                        gsap.to(el, {
                                            rotateX: 0,
                                            rotateY: 0,
                                            duration: 0.3,
                                            ease: 'power2.out'
                                        });
                                    }

                                    if (enableMagnetism) {
                                        gsap.to(el, {
                                            x: 0,
                                            y: 0,
                                            duration: 0.3,
                                            ease: 'power2.out'
                                        });
                                    }
                                };

                                const handleClick = (e: MouseEvent) => {
                                    if (!clickEffect || shouldDisableAnimations) return;

                                    const rect = el.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const y = e.clientY - rect.top;

                                    const maxDistance = Math.max(
                                        Math.hypot(x, y),
                                        Math.hypot(x - rect.width, y),
                                        Math.hypot(x, y - rect.height),
                                        Math.hypot(x - rect.width, y - rect.height)
                                    );

                                    const ripple = document.createElement('div');
                                    ripple.style.cssText = `
                    position: absolute;
                    width: ${maxDistance * 2}px;
                    height: ${maxDistance * 2}px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
                    left: ${x - maxDistance}px;
                    top: ${y - maxDistance}px;
                    pointer-events: none;
                    z-index: 1000;
                  `;

                                    el.appendChild(ripple);

                                    gsap.fromTo(
                                        ripple,
                                        {
                                            scale: 0,
                                            opacity: 1
                                        },
                                        {
                                            scale: 1,
                                            opacity: 0,
                                            duration: 0.8,
                                            ease: 'power2.out',
                                            onComplete: () => ripple.remove()
                                        }
                                    );
                                };

                                el.addEventListener('mousemove', handleMouseMove);
                                el.addEventListener('mouseleave', handleMouseLeave);
                                el.addEventListener('click', handleClick);
                            }}
                        >
                            <div className="magic-bento-card__header">
                                <div className="magic-bento-card__icon" style={{ color: card.iconColor, background: `${card.iconColor}18`, border: `1px solid ${card.iconColor}33` }}>
                                    {card.icon}
                                </div>
                                <div className="magic-bento-card__label">{card.label}</div>
                            </div>
                            {card.heroVisual && card.heroVisual}
                            <div className="magic-bento-card__content">
                                <h2 className="magic-bento-card__title">{card.title}</h2>
                                <p className="magic-bento-card__description">{card.description}</p>
                            </div>
                        </div>
                    );
                })}
            </BentoCardGrid>
        </>
    );
};

export default MagicBento;
