import * as React from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the type for each team member
interface TeamMember {
    name: string;
    emoji: string;
}

// Define the props for the component
export interface AnimatedTeamSectionProps {
    title: string;
    description: string;
    members: TeamMember[];
    className?: string;
}

// Helper function to calculate the final transform values for each card
const getCardState = (index: number, total: number) => {
    const centerIndex = (total - 1) / 2;
    const distanceFromCenter = index - centerIndex;

    const x = distanceFromCenter * 130;
    const y = Math.abs(distanceFromCenter) * -40;
    const rotate = distanceFromCenter * 12;

    return { x, y, rotate };
};

const AnimatedTeamSection = React.forwardRef<
    HTMLDivElement,
    AnimatedTeamSectionProps
>(({ title, description, members, className, ...props }, ref) => {
    const controls = useAnimation();
    // Track which cards have been revealed by the satellite
    const [revealedCards, setRevealedCards] = React.useState<Set<number>>(new Set());

    // Listen for satellite reveal events
    React.useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent<{ index: number }>;
            const cardIndex = customEvent.detail.index;
            setRevealedCards(prev => {
                if (prev.has(cardIndex)) return prev;
                const next = new Set(prev);
                next.add(cardIndex);
                return next;
            });
        };

        window.addEventListener('satellite-reveal-card', handler);
        return () => window.removeEventListener('satellite-reveal-card', handler);
    }, []);

    // Start animation when cards are revealed
    React.useEffect(() => {
        if (revealedCards.size > 0) {
            controls.start("visible");
        }
    }, [controls, revealedCards]);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 },
        visible: (i: number) => ({
            opacity: revealedCards.has(i) ? 1 : 0,
            scale: revealedCards.has(i) ? 1 : 0.5,
            x: revealedCards.has(i) ? getCardState(i, members.length).x : 0,
            y: revealedCards.has(i) ? getCardState(i, members.length).y : 0,
            rotate: revealedCards.has(i) ? getCardState(i, members.length).rotate : 0,
            transition: {
                type: "spring" as const,
                stiffness: 120,
                damping: 12,
            },
        }),
    };

    return (
        <section
            ref={ref}
            className={cn("w-full py-20 lg:py-28 overflow-hidden team-section-anchor", className)}
            style={{ minHeight: '80vh' }}
            {...props}
        >
            <div className="w-full max-w-none mx-auto flex flex-col items-center text-center px-4">
                {/* Section Header */}
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3"
                    style={{ color: '#ffffff' }}>
                    {title}
                </h2>
                <p className="max-w-3xl md:text-xl"
                    style={{ color: '#A0A7C0' }}>
                    {description}
                </p>

                {/* Card fan container */}
                <motion.div
                    className="relative mt-20 w-full"
                    style={{ minHeight: "400px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                >
                    {members.map((member, index) => (
                        <motion.div
                            key={index}
                            className="absolute w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden"
                            custom={index}
                            variants={itemVariants as any}
                            style={{
                                zIndex: members.length - Math.abs(index - (members.length - 1) / 2),
                                background: 'linear-gradient(135deg, rgba(123,97,255,0.15) 0%, rgba(0,245,255,0.08) 100%)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}
                            whileHover={{
                                scale: 1.15,
                                zIndex: 99,
                                transition: { type: "spring", stiffness: 300, damping: 20 },
                            }}
                        >
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl md:text-5xl lg:text-6xl">{member.emoji}</span>
                                <span className="text-xs md:text-sm font-medium px-2 text-center"
                                    style={{ color: '#ffffff', textShadow: '0 0 10px rgba(123,97,255,0.5)' }}>
                                    {member.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
});

AnimatedTeamSection.displayName = "AnimatedTeamSection";

export { AnimatedTeamSection };
