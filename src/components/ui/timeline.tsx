"use client";
import {
    useScroll,
    useTransform,
    motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
    title: string;
    content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setHeight(rect.height);
        }
    }, [ref]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div
            className="w-full font-sans md:px-10"
            ref={containerRef}
            style={{ background: 'transparent' }}
        >
            <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-start pt-10 md:pt-28 md:gap-10"
                    >
                        <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                            <div className="h-8 absolute left-4 md:left-4 w-8 rounded-full flex items-center justify-center"
                                style={{ background: '#0a0e1a', border: '2px solid rgba(0,245,255,0.3)' }}
                            >
                                <div className="h-3 w-3 rounded-full"
                                    style={{ background: 'rgba(0,245,255,0.4)', border: '1px solid rgba(0,245,255,0.6)' }}
                                />
                            </div>
                            <h3 className="hidden md:block text-xl md:text-4xl font-bold"
                                style={{ color: 'rgba(255,255,255,0.35)', paddingLeft: '4.5rem' }}
                            >
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-20 pr-4 md:pl-4 w-full">
                            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold"
                                style={{ color: 'rgba(255,255,255,0.35)' }}
                            >
                                {item.title}
                            </h3>
                            {item.content}
                        </div>
                    </div>
                ))}
                <div
                    className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px]"
                    style={{
                        height: height + "px",
                        background: 'linear-gradient(to bottom, transparent, rgba(0,245,255,0.15), transparent)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                    }}
                >
                    <motion.div
                        className="absolute inset-x-0 top-0 w-[2px] rounded-full"
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                            background: 'linear-gradient(to top, #00F5FF, #7B61FF, transparent)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
