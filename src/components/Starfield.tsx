import { useMemo } from "react";

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

export function Starfield({ count = 120 }: { count?: number }) {
    const stars = useMemo<Star[]>(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 0.5,
            duration: Math.random() * 4 + 2,
            delay: Math.random() * 5,
        }));
    }, [count]);

    return (
        <div className="game-starfield">
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="game-star"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        "--duration": `${star.duration}s`,
                        "--delay": `${star.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}
