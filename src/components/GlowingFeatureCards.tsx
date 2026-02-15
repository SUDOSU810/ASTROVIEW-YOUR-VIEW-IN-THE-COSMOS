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
        icon: <Rocket className="h-4 w-4 text-purple-400" />,
        title: "Real-Time Space Intelligence",
        description:
            "Aggregates live data from trusted sources like NASA and NOAA to deliver accurate, up-to-date space insights.",
        area: "md:[grid-area:1/1/2/5] xl:[grid-area:1/1/2/5]",
    },
    {
        icon: <Globe className="h-4 w-4 text-blue-400" />,
        title: "Location-Aware Personalization",
        description:
            "Customizes celestial events, ISS passes, and sky alerts based on your exact geographic location.",
        area: "md:[grid-area:1/5/2/9] xl:[grid-area:1/5/2/9]",
    },
    {
        icon: <Eye className="h-4 w-4 text-indigo-400" />,
        title: "Smart Sky Events Visibility Score",
        description:
            "Calculates the best viewing opportunities using weather, cloud cover, light pollution, and timing.",
        area: "md:[grid-area:1/9/2/13] xl:[grid-area:1/9/2/13]",
    },
    {
        icon: <Satellite className="h-4 w-4 text-cyan-400" />,
        title: "Live ISS & Satellite Tracking",
        description:
            "Track the International Space Station in real time with interactive maps and 3D orbital visualization.",
        area: "md:[grid-area:2/1/3/5] xl:[grid-area:2/1/3/5]",
    },
    {
        icon: <Sun className="h-4 w-4 text-amber-400" />,
        title: "Space Weather Impact Insights",
        description:
            "Transforms complex solar activity data into simple, real-world effects on GPS, communication, and agriculture.",
        area: "md:[grid-area:2/5/3/9] xl:[grid-area:2/5/3/9]",
    },
    {
        icon: <Gamepad2 className="h-4 w-4 text-emerald-400" />,
        title: "Polaris Constellation Game",
        description:
            "Learn and identify star patterns through an interactive, quiz-based astronomy experience.",
        area: "md:[grid-area:2/9/3/13] xl:[grid-area:2/9/3/13]",
    },
];

export function GlowingFeatureCards() {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-16">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <p className="text-sm font-semibold tracking-widest uppercase text-purple-400 mb-3">
                    Features
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                    Explore the Cosmos Like Never Before
                </h2>
                <p className="max-w-2xl mx-auto text-base text-zinc-400">
                    Powerful tools that bring the universe to your fingertips — personalized, real-time, and beautifully simple.
                </p>
            </motion.div>

            <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-5">
                {features.map((feature, i) => (
                    <GridItem
                        key={i}
                        index={i}
                        area={feature.area}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </ul>
        </section>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    index: number;
}

const GridItem = ({ area, icon, title, description, index }: GridItemProps) => {
    return (
        <motion.li
            className={cn("min-h-[14rem] list-none", area)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            }}
        >
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/[0.08] p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/[0.06] bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 p-6 shadow-sm backdrop-blur-sm md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <motion.div
                            className="w-fit rounded-lg border-[0.75px] border-white/[0.08] bg-white/[0.04] p-2.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                        >
                            {icon}
                        </motion.div>
                        <div className="space-y-3">
                            <motion.h3
                                className="pt-0.5 text-lg leading-snug font-semibold font-sans tracking-[-0.02em] md:text-xl md:leading-[1.625rem] text-balance text-white"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                            >
                                {title}
                            </motion.h3>
                            <motion.p
                                className="font-sans text-sm leading-[1.375rem] md:text-[0.9375rem] md:leading-[1.375rem] text-zinc-400"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
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
