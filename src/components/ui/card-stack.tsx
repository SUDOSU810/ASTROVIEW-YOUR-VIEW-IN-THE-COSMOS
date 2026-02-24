import { useState, useEffect, useCallback, useRef } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    type PanInfo,
} from "framer-motion";
import { cn } from "../../lib/utils";

/* ────────────────────────────────────────────── types ── */
export interface CardItem {
    id: number;
    title: string;
    description: string;
    image: string;
}

export interface CardStackProps {
    items: CardItem[];
    activeIndex: number;
    onActiveChange: (index: number) => void;
    autoAdvanceMs?: number;
    className?: string;
    cardBackImage?: string;
    revealActiveInfo?: boolean; // New prop to control text visibility
}

/* ────────────────────────────── layout math helpers ──── */
function getCardStyle(
    index: number,
    activeIndex: number,
    total: number,
    isMobile: boolean
) {
    const maxVisible = isMobile ? 5 : 5;
    let offset = index - activeIndex;

    // wrap around
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);

    if (absOffset > Math.floor(maxVisible / 2)) {
        return null; // not visible
    }

    const isActive = offset === 0;

    // Arc geometry
    const arcRadius = isMobile ? 420 : 480;
    const angleStep = isMobile ? 14 : 14; // degrees between cards
    const angle = offset * angleStep;
    const angleRad = (angle * Math.PI) / 180;

    const x = Math.sin(angleRad) * arcRadius;
    const y = -(Math.cos(angleRad) * arcRadius - arcRadius); // curve upward

    const scale = isActive ? 1.05 : Math.max(0.55, 1 - absOffset * 0.15);
    const rotateY = offset * (isMobile ? -10 : -8);
    const zIndex = maxVisible - absOffset;
    const brightness = isActive ? 1.0 : Math.max(0.35, 1 - absOffset * 0.2);
    const blur = isActive ? 0 : Math.min(absOffset * 2.5, 8);

    return {
        x,
        y: isActive ? -18 : y + absOffset * 8,
        scale,
        rotateY,
        zIndex,
        brightness,
        blur,
        isActive,
    };
}

/* ────────────────────────────────── main component ───── */
export function CardStack({
    items,
    activeIndex,
    onActiveChange,
    autoAdvanceMs = 2500,
    className,
    cardBackImage,
    revealActiveInfo = true,
}: CardStackProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dragX = useMotionValue(0);
    const dragOpacity = useTransform(dragX, [-150, 0, 150], [0.5, 1, 0.5]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Responsive
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Auto-advance
    useEffect(() => {
        if (isPaused) return;
        const id = setInterval(() => {
            onActiveChange((activeIndex + 1) % items.length);
        }, autoAdvanceMs);
        return () => clearInterval(id);
    }, [activeIndex, isPaused, autoAdvanceMs, items.length, onActiveChange]);

    // Swipe
    const handleDragEnd = useCallback(
        (_: unknown, info: PanInfo) => {
            const threshold = 50;
            if (info.offset.x < -threshold) {
                onActiveChange((activeIndex + 1) % items.length);
            } else if (info.offset.x > threshold) {
                onActiveChange((activeIndex - 1 + items.length) % items.length);
            }
        },
        [activeIndex, items.length, onActiveChange]
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full flex items-center justify-center select-none",
                isMobile ? "h-[320px]" : "h-[380px]",
                className
            )}
            style={{ perspective: "1200px" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Drag surface */}
            <motion.div
                className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
                style={{ opacity: dragOpacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                onDrag={(_, info) => dragX.set(info.offset.x)}
            />

            {/* Cards */}
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                    const style = getCardStyle(
                        index,
                        activeIndex,
                        items.length,
                        isMobile
                    );
                    if (!style) return null;

                    return (
                        <motion.div
                            key={item.id}
                            className={cn(
                                "absolute rounded-2xl overflow-hidden cursor-pointer",
                                isMobile ? "w-[200px] h-[280px]" : "w-[240px] h-[340px]",
                                style.isActive
                                    ? "glow-cyan ring-2 ring-cyan-glow/40"
                                    : "ring-1 ring-white/10"
                            )}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{
                                x: style.x,
                                y: style.y,
                                scale: style.scale,
                                rotateY: style.rotateY,
                                zIndex: style.zIndex,
                                opacity: 1,
                                filter: `blur(${style.blur}px) brightness(${style.brightness})`,
                            }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 26,
                                mass: 0.8,
                            }}
                            onClick={() => {
                                if (!style.isActive) onActiveChange(index);
                            }}
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Card image */}
                            <div className="absolute inset-0">
                                {style.isActive || !cardBackImage ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        draggable={false}
                                    />
                                ) : (
                                    <img
                                        src={cardBackImage}
                                        alt="Card back"
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                )}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-cosmic-900/95 via-cosmic-900/40 to-transparent" />
                            </div>

                            {/* Card content */}
                            <div className="relative h-full flex flex-col justify-end p-5">
                                {style.isActive && revealActiveInfo && (
                                    <>
                                        <h3
                                            className={cn(
                                                "font-bold tracking-wide mb-1",
                                                isMobile ? "text-base" : "text-lg",
                                                "text-cyan-300 text-glow"
                                            )}
                                        >
                                            {item.title}
                                        </h3>
                                        <motion.p
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="text-sm text-gray-400 leading-relaxed line-clamp-3"
                                        >
                                            {item.description}
                                        </motion.p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="absolute -bottom-2 flex gap-1.5 z-40">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onActiveChange(i)}
                        className={cn(
                            "rounded-full transition-all duration-300",
                            i === activeIndex
                                ? "w-6 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                                : "w-2 h-2 bg-cosmic-400 hover:bg-cosmic-300"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
