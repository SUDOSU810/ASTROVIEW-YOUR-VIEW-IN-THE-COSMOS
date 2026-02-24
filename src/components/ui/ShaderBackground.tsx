import { ShootingStars } from "@/components/ui/shooting-stars";

/**
 * Very dark blue/indigo space background with bright twinkling stars,
 * visible nebula glow, and animated shooting stars for all inner pages.
 * Star intensity at 1.5× boost.
 */
export default function ShaderBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #03050f 0%, #060a1a 30%, #0a0e24 60%, #080c1e 100%)',
        overflow: 'hidden',
      }}
    >
      {/* ── Nebula glow blobs ── */}
      <div
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          top: '-15%',
          right: '-10%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,255,0.12) 0%, rgba(0,245,255,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'drift1 20s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          bottom: '-10%',
          left: '-10%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,97,255,0.14) 0%, rgba(123,97,255,0.05) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'drift2 25s ease-in-out infinite alternate',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          top: '35%',
          left: '25%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(60,30,120,0.12) 0%, rgba(30,15,80,0.04) 40%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'drift1 30s ease-in-out infinite alternate-reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          top: '10%',
          left: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,100,200,0.06) 0%, transparent 60%)',
          filter: 'blur(70px)',
          animation: 'drift2 22s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* ── Star layers (1.5× boosted) ── */}
      <div className="bg-stars-tiny" />
      <div className="bg-stars-small" />
      <div className="bg-stars-medium" />
      <div className="bg-stars-bright" />

      {/* ── Shooting stars ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <ShootingStars
          starColor="#7B61FF"
          trailColor="#00F5FF"
          minSpeed={15}
          maxSpeed={35}
          minDelay={1200}
          maxDelay={3500}
        />
        <ShootingStars
          starColor="#00F5FF"
          trailColor="#7B61FF"
          minSpeed={10}
          maxSpeed={25}
          minDelay={2000}
          maxDelay={5000}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <style>{`
        .bg-stars-tiny,
        .bg-stars-small,
        .bg-stars-medium,
        .bg-stars-bright {
          position: absolute;
          inset: 0;
        }

        /* ── Tiny dots — dense field (1.5× boosted) ── */
        .bg-stars-tiny {
          background-image:
            radial-gradient(1px 1px at 2% 8%, #fff, transparent),
            radial-gradient(1px 1px at 7% 22%, #fff, transparent),
            radial-gradient(1px 1px at 12% 55%, #fff, transparent),
            radial-gradient(1px 1px at 18% 78%, #fff, transparent),
            radial-gradient(1px 1px at 24% 12%, #fff, transparent),
            radial-gradient(1px 1px at 29% 45%, #fff, transparent),
            radial-gradient(1px 1px at 35% 88%, #fff, transparent),
            radial-gradient(1px 1px at 41% 33%, #fff, transparent),
            radial-gradient(1px 1px at 47% 67%, #fff, transparent),
            radial-gradient(1px 1px at 53% 5%, #fff, transparent),
            radial-gradient(1px 1px at 58% 42%, #fff, transparent),
            radial-gradient(1px 1px at 64% 91%, #fff, transparent),
            radial-gradient(1px 1px at 70% 18%, #fff, transparent),
            radial-gradient(1px 1px at 76% 60%, #fff, transparent),
            radial-gradient(1px 1px at 82% 35%, #fff, transparent),
            radial-gradient(1px 1px at 88% 73%, #fff, transparent),
            radial-gradient(1px 1px at 93% 50%, #fff, transparent),
            radial-gradient(1px 1px at 97% 85%, #fff, transparent),
            radial-gradient(1px 1px at 4% 48%, #fff, transparent),
            radial-gradient(1px 1px at 14% 30%, #fff, transparent),
            radial-gradient(1px 1px at 37% 15%, #fff, transparent),
            radial-gradient(1px 1px at 62% 72%, #fff, transparent),
            radial-gradient(1px 1px at 79% 8%, #fff, transparent),
            radial-gradient(1px 1px at 91% 38%, #fff, transparent);
          opacity: 1;
          animation: twinkle-a 3s ease-in-out infinite alternate;
        }

        /* ── Small stars (1.5× boosted) ── */
        .bg-stars-small {
          background-image:
            radial-gradient(1.5px 1.5px at 5% 15%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 10% 65%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 16% 40%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 22% 90%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 33% 20%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 38% 72%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 45% 48%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 52% 82%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 60% 10%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 68% 55%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 75% 30%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 83% 68%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 90% 15%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 95% 50%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 27% 58%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 48% 25%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 72% 78%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 86% 42%, #fff, transparent);
          opacity: 1;
          animation: twinkle-b 5s ease-in-out infinite alternate;
        }

        /* ── Medium stars (1.5× boosted) ── */
        .bg-stars-medium {
          background-image:
            radial-gradient(2.5px 2.5px at 8% 30%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 20% 75%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 30% 50%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 42% 15%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 55% 70%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 65% 38%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 78% 85%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 85% 22%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 92% 62%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 48% 92%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 15% 52%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 38% 8%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 62% 45%, #fff, transparent),
            radial-gradient(2.5px 2.5px at 88% 55%, #fff, transparent);
          opacity: 1;
          animation: twinkle-c 7s ease-in-out infinite alternate;
        }

        /* ── Bright prominent stars — colored tints (1.5× boosted) ── */
        .bg-stars-bright {
          background-image:
            radial-gradient(4px 4px at 15% 25%, rgba(0,245,255,1), transparent),
            radial-gradient(4px 4px at 35% 60%, rgba(255,255,255,1), transparent),
            radial-gradient(3.5px 3.5px at 50% 35%, rgba(123,97,255,1), transparent),
            radial-gradient(4px 4px at 72% 50%, rgba(255,255,255,1), transparent),
            radial-gradient(3.5px 3.5px at 88% 40%, rgba(0,245,255,1), transparent),
            radial-gradient(4px 4px at 25% 80%, rgba(255,255,255,1), transparent),
            radial-gradient(3.5px 3.5px at 60% 88%, rgba(123,97,255,0.9), transparent),
            radial-gradient(4px 4px at 80% 12%, rgba(255,255,255,1), transparent),
            radial-gradient(3.5px 3.5px at 5% 55%, rgba(0,245,255,0.9), transparent),
            radial-gradient(4px 4px at 42% 78%, rgba(255,255,255,1), transparent),
            radial-gradient(3.5px 3.5px at 95% 20%, rgba(123,97,255,0.9), transparent),
            radial-gradient(4px 4px at 68% 5%, rgba(255,255,255,1), transparent);
          opacity: 1;
          animation: twinkle-d 4s ease-in-out infinite alternate;
        }

        @keyframes twinkle-a {
          0% { opacity: 0.75; }
          100% { opacity: 1; }
        }
        @keyframes twinkle-b {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        @keyframes twinkle-c {
          0% { opacity: 0.65; }
          100% { opacity: 1; }
        }
        @keyframes twinkle-d {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        @keyframes drift1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-40px, 30px) scale(1.05); }
        }
        @keyframes drift2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
