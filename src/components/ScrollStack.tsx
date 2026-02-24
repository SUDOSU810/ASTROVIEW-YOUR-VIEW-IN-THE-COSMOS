import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import './ScrollStack.css';

export interface ScrollStackItemProps {
    itemClassName?: string;
    children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
    className?: string;
    children: ReactNode;
    itemDistance?: number;
    itemScale?: number;
    itemStackDistance?: number;
    stackPosition?: string;
    scaleEndPosition?: string;
    baseScale?: number;
    onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    children,
    className = '',
    itemDistance = 80,
    itemScale = 0.03,
    itemStackDistance = 20,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.9,
    onStackComplete
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const cardsRef = useRef<HTMLElement[]>([]);

    // Cache positions once — avoids layout thrashing
    const cachedOffsetsRef = useRef<number[]>([]);
    const cachedEndOffsetRef = useRef<number>(0);
    const stackCompletedRef = useRef(false);

    const cachePositions = useCallback(() => {
        const cards = cardsRef.current;
        if (!cards.length) return;

        cachedOffsetsRef.current = cards.map(card => {
            const rect = card.getBoundingClientRect();
            return rect.top + window.scrollY;
        });

        const endEl = document.querySelector('.scroll-stack-end') as HTMLElement;
        if (endEl) {
            const rect = endEl.getBoundingClientRect();
            cachedEndOffsetRef.current = rect.top + window.scrollY;
        }
    }, []);

    const updateCards = useCallback(() => {
        const cards = cardsRef.current;
        const offsets = cachedOffsetsRef.current;
        if (!cards.length || !offsets.length) return;

        const scrollTop = window.scrollY;
        const vh = window.innerHeight;
        const stackPx = (parseFloat(stackPosition) / 100) * vh;
        const scaleEndPx = (parseFloat(scaleEndPosition) / 100) * vh;
        const endTop = cachedEndOffsetRef.current;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardTop = offsets[i];

            const triggerStart = cardTop - stackPx - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPx;
            const pinStart = triggerStart;
            const pinEnd = endTop - vh / 2;

            // Scale progress (0 → 1)
            let scaleProgress = 0;
            if (scrollTop > triggerStart && triggerEnd > triggerStart) {
                scaleProgress = Math.min(1, (scrollTop - triggerStart) / (triggerEnd - triggerStart));
            }

            const targetScale = baseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);

            // Pin translation
            let translateY = 0;
            if (scrollTop >= pinStart && scrollTop <= pinEnd) {
                translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;
            }

            // Apply directly — no diffing overhead, GPU composites these cheaply
            card.style.transform = `translate3d(0,${translateY | 0}px,0) scale(${scale.toFixed(3)})`;

            // Stack completion callback
            if (i === cards.length - 1) {
                const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
                if (inView && !stackCompletedRef.current) {
                    stackCompletedRef.current = true;
                    onStackComplete?.();
                } else if (!inView) {
                    stackCompletedRef.current = false;
                }
            }
        }
    }, [stackPosition, scaleEndPosition, itemStackDistance, baseScale, itemScale, onStackComplete]);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const cards = Array.from(
            document.querySelectorAll('.scroll-stack-card')
        ) as HTMLElement[];
        cardsRef.current = cards;

        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                card.style.marginBottom = `${itemDistance}px`;
            }
        });

        // Cache initial positions (one-time layout read)
        cachePositions();

        // Lightweight rAF loop — only reads window.scrollY, no layout queries
        const raf = () => {
            updateCards();
            animationFrameRef.current = requestAnimationFrame(raf);
        };
        animationFrameRef.current = requestAnimationFrame(raf);

        // Recache on resize (window size changes card positions)
        const onResize = () => cachePositions();
        window.addEventListener('resize', onResize, { passive: true });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('resize', onResize);
            cardsRef.current = [];
            cachedOffsetsRef.current = [];
        };
    }, [itemDistance, cachePositions, updateCards]);

    return (
        <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
            <div className="scroll-stack-inner">
                {children}
                <div className="scroll-stack-end" />
            </div>
        </div>
    );
};

export default ScrollStack;
