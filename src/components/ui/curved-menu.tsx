"use client";
import React, { useState, useRef, useEffect } from "react";

import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Linkedin, Github, Dribbble, Figma, LogOut } from "lucide-react";
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
  footer?: React.ReactNode;
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

const CustomFooter: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex w-full flex-col gap-3 px-10 md:px-24 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {user && (
        <div className="flex items-center gap-3 mb-1">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #00F5FF, #7B61FF)',
              fontSize: '0.95rem', fontWeight: 700, color: '#0a0e1a',
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{user.name}</p>
            <p style={{ color: '#A0A7C0', fontSize: '0.75rem', margin: 0 }}>{user.email}</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl cursor-pointer"
        style={{
          background: 'rgba(255, 68, 102, 0.12)',
          border: '1px solid rgba(255, 68, 102, 0.25)',
          color: '#ff4466',
          fontSize: '0.88rem',
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 68, 102, 0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 68, 102, 0.12)';
        }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
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

const CurvedNavbar: React.FC<
  iCurvedNavbarProps & { footer?: React.ReactNode; onNavigate: (href: string) => void }
> = ({ setIsActive, navItems, footer, onNavigate }) => {
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
        {/* Navigation items arranged in a circular arc */}
        <div className="relative h-full w-full flex flex-col items-end justify-center">
          {/* Arc-positioned nav items */}
          <div className="relative w-full h-full">

            {navItems.map((item, index) => {
              const total = navItems.length;
              // Linear vertical spacing for even gaps
              const startTop = 9;
              const endTop = 81;
              const topPercent = startTop + (index * (endTop - startTop)) / (total - 1);

              // Back-calculate angle from top position to maintain curve path
              // verticalCenter = 45, radiusY = 40
              // topPercent = 45 + sin(angle) * 40  =>  sin(angle) = (top - 45) / 40
              const verticalCenter = 45;
              const angleRad = Math.asin((topPercent - verticalCenter) / 40);
              
              const leftPercent = 11 + (1 - Math.cos(angleRad)) * 45;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    transform: 'translateY(-50%)',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
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

          {/* Social links at bottom of the arc */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute bottom-8 right-0 w-full flex justify-center gap-6"
            style={{ paddingLeft: '30%' }}
          >
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <s.icon size={20} />
              </a>
            ))}
          </motion.div>
        </div>
        <Curve />
      </motion.div>
    </>
  );
};

const Header: React.FC<iHeaderProps> = ({
  navItems = defaultNavItems,
  footer = <CustomFooter />,
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
            footer={footer}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;