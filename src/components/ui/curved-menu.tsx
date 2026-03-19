"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Linkedin, Github, Dribbble, Figma, LogOut, ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
  imgSrc?: string;
}

interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
  onNavigate: (href: string) => void;
}

interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
}

interface iHeaderProps {
  navItems?: iNavItem[];
}

const MENU_SLIDE_ANIMATION = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
  exit: {
    x: "calc(100% + 100px)",
    opacity: 0,
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
  },
};

const defaultNavItems: iNavItem[] = [
  {
    heading: " Home",
    href: "/",
    subheading: "Back to landing",
  },
  {
    heading: " Dashboard",
    href: "/dashboard",
    subheading: "Your space intelligence hub",
  },
  {
    heading: " Sky Events",
    href: "/sky-events",
    subheading: "Tonight's celestial events",
  },
  {
    heading: " Space Impact",
    href: "/space-impact",
    subheading: "How space affects Earth",
  },
  {
    heading: " Live Tracker",
    href: "/live-tracker",
    subheading: "Real-time ISS tracking",
  },
  {
    heading: " Polaris",
    href: "/constellation-game",
    subheading: "Constellation quiz challenge",
  },
  {
    heading: " Timeline",
    href: "/timeline",
    subheading: "Journey through space history",
  },
  {
    heading: " Infographic-3D",
    href: "/space-explorer",
    subheading: "3d Infographic",
  },
  {
    heading: " Profile",
    href: "/profile",
    subheading: "Account & preferences",
  },
];

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Dribbble, href: "https://dribbble.com", label: "Dribbble" },
  { icon: Figma, href: "https://www.figma.com", label: "Figma" },
];

const CenterUserPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '38%',
        right: '20px',
        transform: 'translateY(-50%)',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '18px 20px',
        borderRadius: '16px',
        background: 'rgba(10,14,26,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        width: '160px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Avatar */}
      {user && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF9FFC, #7B61FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: '#0a0e1a',
              boxShadow: '0 0 20px rgba(255,159,252,0.25)',
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, margin: 0, textAlign: 'center', letterSpacing: '0.3px' }}>
            {user.name}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', margin: 0, textAlign: 'center' }}>
            {user.email}
          </p>
        </div>
      )}

      {/* Social links */}
      <div style={{ display: 'flex', gap: '14px', padding: '4px 0' }}>
        {socialLinks.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 hover:scale-110"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF9FFC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <s.icon size={16} />
          </a>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 cursor-pointer"
        style={{
          width: '100%',
          padding: '7px 18px',
          borderRadius: '10px',
          background: 'rgba(255, 68, 102, 0.08)',
          border: '1px solid rgba(255, 68, 102, 0.18)',
          color: '#ff4466',
          fontSize: '0.76rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 68, 102, 0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 68, 102, 0.08)';
        }}
      >
        <LogOut size={14} />
        Logout
      </button>
    </motion.div>
  );
};

const NavLink: React.FC<iNavLinkProps> = ({
  heading,
  href,
  setIsActive,
  index,
  onNavigate,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const rect = ref.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = () => {
    setIsActive(false);
    onNavigate(href);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center uppercase cursor-pointer"
      style={{ padding: '0.6rem 0' }}
    >
      <div ref={ref} onMouseMove={handleMouseMove} style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <div className="relative flex items-center">
          <span
            className="transition-colors duration-500 text-2xl md:text-3xl font-thin mr-2"
            style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.2)' }}
          >
            {index}.
          </span>
          <motion.span
            variants={{
              initial: { x: 0 },
              whileHover: { x: -8 },
            }}
            transition={{
              type: "spring",
              staggerChildren: 0.075,
              delayChildren: 0.25,
            }}
            className="relative z-10 block text-2xl md:text-3xl font-extralight transition-colors duration-500"
            style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.2)' }}
          >
            {heading.split("").map((letter, i) => {
              return (
                <motion.span
                  key={i}
                  variants={{
                    initial: { x: 0 },
                    whileHover: { x: 8 },
                  }}
                  transition={{ type: "spring" }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              );
            })}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const Curve: React.FC = () => {
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!windowHeight) return null;

  const initialPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q-100 ${windowHeight / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${windowHeight} L100 ${windowHeight} Q100 ${windowHeight / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: 1, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: initialPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
    },
  };

  return (
    <svg
      className="absolute top-0 -left-[99px] w-[100px] h-full"
      style={{ fill: '#0a0e1a', overflow: 'visible' }}
    >
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

// ── Rotary Dial constants ──
const VISIBLE_SLOTS = 8; // how many items fit on the arc at once
const ARC_START = 9;     // top % of first visible item
const ARC_END = 88;      // top % of last visible item

const CurvedNavbar: React.FC<
  iCurvedNavbarProps & { onNavigate: (href: string) => void }
> = ({ setIsActive, navItems, onNavigate }) => {
  // ── Rotary dial scroll state ──
  const [scrollOffset, setScrollOffset] = useState(0);
  const maxScroll = Math.max(0, navItems.length - VISIBLE_SLOTS);
  const springOffset = useSpring(0, { stiffness: 300, damping: 30 });
  const touchStartY = useRef<number | null>(null);
  const touchStartOffset = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep spring in sync
  useEffect(() => {
    springOffset.set(scrollOffset);
  }, [scrollOffset, springOffset]);

  // Mouse wheel handler — rotary dial feel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 1 : -1;
      setScrollOffset((prev) => Math.max(0, Math.min(maxScroll, prev + delta)));
    },
    [maxScroll]
  );

  // Touch handlers for mobile drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartOffset.current = scrollOffset;
  }, [scrollOffset]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const dy = touchStartY.current - e.touches[0].clientY;
      const steps = Math.round(dy / 50); // 50px per step
      const next = Math.max(0, Math.min(maxScroll, touchStartOffset.current + steps));
      setScrollOffset(next);
    },
    [maxScroll]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
  }, []);

  // Attach wheel listener (passive: false to prevent page scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset < maxScroll;

  return (
    <>
      {/* Blur backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => setIsActive(false)}
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(3,5,15,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />

      {/* User panel — fixed position, outside the curved container */}
      <CenterUserPanel />

      <motion.div
        variants={MENU_SLIDE_ANIMATION}
        initial="initial"
        animate="enter"
        exit="exit"
        className="h-[100dvh] w-screen max-w-screen-sm fixed right-0 top-0 z-40"
        style={{
          background: '#0a0e1a',
          borderRadius: '50% 0 0 50%',
          overflow: 'hidden',
          borderLeft: '1.5px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Navigation items arranged in a circular arc — rotary dial */}
        <div
          ref={containerRef}
          className="relative h-full w-full flex flex-col items-end justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Scroll-up chevron indicator */}
          <AnimatePresence>
            {canScrollUp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setScrollOffset((p) => Math.max(0, p - 1))}
                style={{
                  position: 'absolute',
                  top: '3%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  transition: 'color 0.2s',
                }}
                whileHover={{ color: '#fff', scale: 1.15 }}
              >
                <ChevronUp size={22} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arc-positioned nav items */}
          <div className="relative w-full h-full">
            {navItems.map((item, index) => {
              // Position relative to scroll window
              const virtualIndex = index - scrollOffset;

              // Items outside visible range — fade out
              if (virtualIndex < -0.5 || virtualIndex > VISIBLE_SLOTS - 0.5) return null;

              const slotsForSpacing = VISIBLE_SLOTS - 1;
              const topPercent = ARC_START + (virtualIndex * (ARC_END - ARC_START)) / slotsForSpacing;

              // Back-calculate angle from top position to maintain curve path
              const verticalCenter = (ARC_START + ARC_END) / 2;
              const radiusY = (ARC_END - ARC_START) / 2;
              const sinVal = Math.max(-1, Math.min(1, (topPercent - verticalCenter) / radiusY));
              const angleRad = Math.asin(sinVal);
              const leftPercent = 11 + (1 - Math.cos(angleRad)) * 45;

              // Fade edges
              const edgeDist = Math.min(virtualIndex + 0.5, VISIBLE_SLOTS - 0.5 - virtualIndex);
              const itemOpacity = edgeDist < 0.5 ? edgeDist * 2 : 1;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: itemOpacity, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{
                    opacity: { duration: 0.3, ease: 'easeOut' },
                    x: { delay: 0.3 + index * 0.06, duration: 0.5, ease: 'easeOut' },
                  }}
                  style={{
                    position: 'absolute',
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
                    transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
                  }}
                >
                  {/* Individual button container */}
                  <div
                    style={{
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '14px',
                      padding: '3px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(4px)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                  >
                    <NavLink
                      {...item}
                      setIsActive={setIsActive}
                      index={index + 1}
                      onNavigate={onNavigate}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll-down chevron indicator */}
          <AnimatePresence>
            {canScrollDown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setScrollOffset((p) => Math.min(maxScroll, p + 1))}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  transition: 'color 0.2s',
                }}
                whileHover={{ color: '#fff', scale: 1.15 }}
              >
                <ChevronDown size={22} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        <Curve />
      </motion.div>
    </>
  );
};

const Header: React.FC<iHeaderProps> = ({
  navItems = defaultNavItems,
}) => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const handleNavigate = (href: string) => {
    // Delay navigation to let the exit animation play
    setTimeout(() => {
      navigate(href);
    }, 600);
  };

  return (
    <>
      <div className="relative">
        <div
          onClick={handleClick}
          className="fixed right-4 top-4 md:right-6 md:top-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          {/* ── Thick bars, very tight gap ── */}
          <div
            className="relative flex flex-col items-center"
            style={{ gap: '2px' }}
          >
            <span
              className={`block w-8 transition-transform duration-300 ${isActive ? "rotate-45 translate-y-[6px]" : ""}`}
              style={{
                height: '4px',
                borderRadius: '2px',
                background: '#ffffff',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
              }}
            />
            <span
              className={`block w-8 transition-all duration-300 ${isActive ? "opacity-0 scale-x-0" : ""}`}
              style={{
                height: '4px',
                borderRadius: '2px',
                background: '#ffffff',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
              }}
            />
            <span
              className={`block w-8 transition-transform duration-300 ${isActive ? "-rotate-45 -translate-y-[6px]" : ""}`}
              style={{
                height: '4px',
                borderRadius: '2px',
                background: '#ffffff',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
              }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isActive && (
          <CurvedNavbar
            setIsActive={setIsActive}


            navItems={navItems}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;