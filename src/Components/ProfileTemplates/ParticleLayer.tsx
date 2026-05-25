import { useMemo } from "react";
import type { ProfileEffect } from "./types";

export const ParticleLayer = ({ effect }: { effect: ProfileEffect }) => {
  const particles = useMemo(() => {
    const count =
      effect === "stars"
        ? 28
        : effect === "snow"
        ? 30
        : effect === "sparkles"
        ? 20
        : effect === "hearts"
        ? 16
        : 0;

    return Array.from({ length: count }, (_, index) => ({
      id: `${effect}-${index}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 8 + Math.random() * 18,
      duration: 4 + Math.random() * 8,
      delay: Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.7,
    }));
  }, [effect]);

  if (effect === "none") return null;

  return (
    <>
      <style>{`
        @keyframes arcxnjoTwinkle {
          0%,100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 0.95; transform: scale(1.15); }
        }
        @keyframes arcxnjoSnowFall {
          0% { transform: translateY(-12vh); opacity: 0; }
          10% { opacity: 0.85; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes arcxnjoFloatUp {
          0% { transform: translateY(16px) scale(0.9); opacity: 0; }
          10% { opacity: 0.85; }
          100% { transform: translateY(-110vh) scale(1.08); opacity: 0; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {effect === "stars" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size / 4}px`,
                height: `${particle.size / 4}px`,
                opacity: particle.opacity,
                animation: `arcxnjoTwinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                boxShadow: "0 0 10px rgba(255,255,255,0.55)",
              }}
            />
          ))}

        {effect === "snow" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${particle.left}%`,
                top: `-${particle.size}px`,
                width: `${particle.size / 3}px`,
                height: `${particle.size / 3}px`,
                opacity: particle.opacity,
                animation: `arcxnjoSnowFall ${particle.duration + 4}s linear ${particle.delay}s infinite`,
              }}
            />
          ))}

        {effect === "sparkles" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute text-white"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `arcxnjoTwinkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                textShadow: "0 0 12px rgba(255,255,255,0.5)",
              }}
            >
              ✦
            </span>
          ))}

        {effect === "hearts" &&
          particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute text-pink-300"
              style={{
                left: `${particle.left}%`,
                bottom: "-24px",
                fontSize: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `arcxnjoFloatUp ${particle.duration + 5}s linear ${particle.delay}s infinite`,
                textShadow: "0 0 14px rgba(255,105,180,0.4)",
              }}
            >
              ♥
            </span>
          ))}
      </div>
    </>
  );
};
