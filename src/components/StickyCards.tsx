/**
 * Sticky Cards — scroll-driven card stack with scale + rotation
 * Based on Skiper34 by @gurvinder-singh02
 * Adapted for AstroView — "Why AstroView" section
 */

import {
    motion,
    useInView,
    useMotionValue,
    useScroll,
    useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./StickyCards.css";

export interface StickyCardData {
    imgUrl: string;
    title?: string;
    description?: string;
    icon?: string;
    stat?: string;
}

const defaultCards: StickyCardData[] = [
    {
        imgUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
        title: "Live Space Monitoring",
        description: "Real-time data streams from NASA, the ISS, and global weather APIs — monitored around the clock so you never miss a cosmic event.",
        icon: "🛰️",
        stat: "24/7",
    },
    {
        imgUrl: "https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200&q=80",
        title: "Data Sources Aggregated",
        description: "We pull from dozens of scattered, technical sources and consolidate everything into one clean dashboard. No more tab-hopping.",
        icon: "📡",
        stat: "5+",
    },
    {
        imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
        title: "Location-Personalized",
        description: "Every data point is localized to your exact coordinates — visibility scores, pass predictions, and alerts tailored to where you are.",
        icon: "📍",
        stat: "100%",
    },
];

interface StickyCardsProps {
    cards?: StickyCardData[];
}

const StickyCards = ({ cards = defaultCards }: StickyCardsProps) => {
    return (
        <section className="relative flex w-full flex-col items-center gap-[10vh] px-4 py-[10vh]">
            {cards.map((card, idx) => (
                <StickyCard key={idx} card={card} />
            ))}
        </section>
    );
};

const StickyCard = ({ card }: { card: StickyCardData }) => {
    const vertMargin = 10;
    const container = useRef(null);
    const [maxScrollY, setMaxScrollY] = useState(Infinity);

    const filter = useMotionValue(0);
    const negateFilter = useTransform(filter, (value) => -value);

    const { scrollY } = useScroll({
        target: container,
    });
    const scale = useTransform(scrollY, [maxScrollY, maxScrollY + 10000], [1, 0]);
    const isInView = useInView(container, {
        margin: `0px 0px -${100 - vertMargin}% 0px`,
        once: true,
    });

    scrollY.on("change", (scrollY) => {
        let animationValue = 1;
        if (scrollY > maxScrollY) {
            animationValue = Math.max(0, 1 - (scrollY - maxScrollY) / 10000);
        }

        scale.set(animationValue);
        filter.set((1 - animationValue) * 100);
    });

    useEffect(() => {
        if (isInView) {
            setMaxScrollY(scrollY.get());
        }
    }, [isInView]);

    return (
        <motion.div
            ref={container}
            className="sticky overflow-hidden group"
            style={{
                scale: scale,
                rotate: filter,
                height: `${100 - 2 * vertMargin}vh`,
                top: `${vertMargin}vh`,
                width: "100%",
                maxWidth: "56rem",
                borderRadius: "1.5rem",
            }}
        >
            {/* Background image */}
            <motion.img
                src={card.imgUrl}
                alt={card.title || ""}
                style={{
                    rotate: negateFilter,
                    opacity: 0.87
                }}
                className="h-full w-full scale-125 object-cover"
                sizes="90vw"
            />

            {/* Content overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "2.5rem",
                    gap: "0.5rem",
                }}
            >
                {card.icon && (
                    <span style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>{card.icon}</span>
                )}
                {card.stat && (
                    <span
                        style={{
                            fontSize: "4.5rem",
                            fontWeight: 900,
                            fontFamily: "'Inter', sans-serif",
                            lineHeight: 1,
                            background: "linear-gradient(135deg, #7b61ff, #00f5ff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.04em",
                        }}
                    >
                        {card.stat}
                    </span>
                )}
                {card.title && (
                    <h3
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                        }}
                        className="underline-animation"
                    >
                        {card.title}
                    </h3>
                )}
                {card.description && (
                    <p
                        style={{
                            fontSize: "1.25rem",
                            color: "rgba(255,255,255,0.7)",
                            margin: 0,
                            maxWidth: "40rem",
                            lineHeight: 1.6,
                            fontWeight: 500,
                        }}
                        className="underline-animation sticky-description"
                    >
                        {card.description}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default StickyCards;
export { StickyCard };
