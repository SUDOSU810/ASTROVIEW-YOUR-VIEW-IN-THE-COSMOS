import {
    Rocket,
    Globe,
    Eye,
    Satellite,
    Sun,
    Gamepad2,
} from "lucide-react";
import { motion } from "framer-motion";
import { GlowingEffect } from "./ui/glowing-effect";
import { cn } from "../lib/utils";

const features = [
    {
        icon: <Rocket className="h-5 w-5" />,
        title: "Real-Time Space Intelligence",
        description:
            "Aggregates live data from trusted sources like NASA and NOAA to deliver accurate, up-to-date space insights.",
        area: "md:[grid-area:1/1/2/7]",
        iconColor: "#c084fc",
        iconBg: "rgba(192, 132, 252, 0.12)",
        iconBorder: "rgba(192, 132, 252, 0.2)",
    },
    {
        icon: <Globe className="h-5 w-5" />,
        title: "Location-Aware Personalization",
        description:
            "Customizes celestial events, ISS passes, and sky alerts based on your exact geographic location.",
        area: "md:[grid-area:1/7/2/13]",
        iconColor: "#60a5fa",
        iconBg: "rgba(96, 165, 250, 0.12)",
        iconBorder: "rgba(96, 165, 250, 0.2)",
    },
    {
        icon: <Eye className="h-5 w-5" />,
        title: "Smart Sky Visibility Score",
        description:
            "Calculates the best viewing opportunities using weather, cloud cover, light pollution, and timing.",
        area: "md:[grid-area:2/1/3/5]",
        iconColor: "#818cf8",
        iconBg: "rgba(129, 140, 248, 0.12)",
        iconBorder: "rgba(129, 140, 248, 0.2)",
    },
    {
        icon: <Satellite className="h-5 w-5" />,
        title: "Live ISS & Satellite Tracking",
        description:
            "Track the International Space Station in real time with interactive maps and 3D orbital visualization.",
        area: "md:[grid-area:2/5/3/9]",
        iconColor: "#22d3ee",
        iconBg: "rgba(34, 211, 238, 0.12)",
        iconBorder: "rgba(34, 211, 238, 0.2)",
    },
    {
        icon: <Sun className="h-5 w-5" />,
        title: "Space Weather Insights",
        description:
            "Transforms complex solar activity data into simple, real-world effects on GPS, communication, and agriculture.",
        area: "md:[grid-area:2/9/3/13]",
        iconColor: "#fbbf24",
        iconBg: "rgba(251, 191, 36, 0.12)",
        iconBorder: "rgba(251, 191, 36, 0.2)",
    },
    {
        icon: <Gamepad2 className="h-5 w-5" />,
        title: "Polaris Constellation Game",
        description:
            "Learn and identify star patterns through an interactive, quiz-based astronomy experience.",
        area: "md:[grid-area:3/1/4/5]",
        iconColor: "#34d399",
        iconBg: "rgba(52, 211, 153, 0.12)",
        iconBorder: "rgba(52, 211, 153, 0.2)",
    },
];

export function GlowingFeatureCards() {
    return (
        <section
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "5rem 1.5rem",
            }}
        >
            <div style={{ width: "100%", maxWidth: "1100px" }}>
                <motion.div
                    style={{ textAlign: "center", marginBottom: "3.5rem" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "#c084fc",
                            marginBottom: "0.75rem",
                        }}
                    >
                        ✨ Features
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                            fontWeight: 800,
                            letterSpacing: "-0.5px",
                            color: "#fff",
                            marginBottom: "0.75rem",
                        }}
                    >
                        Explore the Cosmos Like Never Before
                    </h2>
                    <p
                        style={{
                            maxWidth: "580px",
                            margin: "0 auto",
                            fontSize: "1rem",
                            color: "#a1a1aa",
                            lineHeight: 1.6,
                        }}
                    >
                        Powerful tools that bring the universe to your fingertips
                        — personalized, real-time, and beautifully simple.
                    </p>
                </motion.div>

                <ul
                    className="grid grid-cols-1 md:grid-cols-12 lg:gap-5"
                    style={{
                        gap: "1.1rem",
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    {features.map((feature, i) => (
                        <GridItem
                            key={i}
                            index={i}
                            area={feature.area}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            iconColor={feature.iconColor}
                            iconBg={feature.iconBg}
                            iconBorder={feature.iconBorder}
                        />
                    ))}
                </ul>
            </div>
        </section>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    index: number;
    iconColor: string;
    iconBg: string;
    iconBorder: string;
}

const GridItem = ({
    area,
    icon,
    title,
    description,
    index,
    iconColor,
    iconBg,
    iconBorder,
}: GridItemProps) => {
    return (
        <motion.li
            className={cn("list-none", area)}
            style={{ minHeight: "12rem" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            }}
        >
            <div
                className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/[0.08] p-2 md:rounded-[1.5rem] md:p-3"
            >
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div
                    className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border-[0.75px] border-white/[0.06] shadow-sm backdrop-blur-sm"
                    style={{
                        padding: "1.75rem",
                        gap: "1rem",
                        background:
                            "linear-gradient(to bottom right, rgba(24, 24, 27, 0.85), rgba(9, 9, 11, 0.95))",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "1rem",
                            flex: 1,
                        }}
                    >
                        <motion.div
                            style={{
                                width: "fit-content",
                                borderRadius: "12px",
                                border: `1px solid ${iconBorder}`,
                                background: iconBg,
                                padding: "0.65rem",
                                color: iconColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1 + 0.2,
                            }}
                        >
                            {icon}
                        </motion.div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                            }}
                        >
                            <motion.h3
                                style={{
                                    fontSize: "1.15rem",
                                    lineHeight: 1.3,
                                    fontWeight: 600,
                                    letterSpacing: "-0.02em",
                                    color: "#fff",
                                    margin: 0,
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1 + 0.3,
                                }}
                            >
                                {title}
                            </motion.h3>
                            <motion.p
                                style={{
                                    fontSize: "0.875rem",
                                    lineHeight: 1.55,
                                    color: "#a1a1aa",
                                    margin: 0,
                                }}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1 + 0.4,
                                }}
                            >
                                {description}
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.li>
    );
};
