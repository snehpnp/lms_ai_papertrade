import React from "react";
import { motion } from "framer-motion";

export type MascotMood = "happy" | "excited" | "thinking" | "confident" | "winking";

interface MascotProps {
    mood?: MascotMood;
    size?: number;
}

export const MascotExpression: React.FC<MascotProps> = ({ mood = "happy", size = 120 }) => {
    const expressions = {
        happy: { eyeScale: 1, mouthPath: "M 35 65 Q 50 78 65 65", browAngle: 0, pupils: [42, 52] },
        excited: { eyeScale: 1.2, mouthPath: "M 30 60 Q 50 82 70 60", browAngle: -5, pupils: [42, 50] },
        thinking: { eyeScale: 0.9, mouthPath: "M 38 68 Q 50 72 62 68", browAngle: 8, pupils: [45, 52] },
        confident: { eyeScale: 1, mouthPath: "M 35 64 Q 50 76 65 64", browAngle: -3, pupils: [42, 52] },
        winking: { eyeScale: 1, mouthPath: "M 33 64 Q 50 78 67 64", browAngle: -5, pupils: [42, 52] },
    };
    const e = expressions[mood] || expressions.happy;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow */}
            <defs>
                <radialGradient id="bodyGrad" cx="50%" cy="45%" r="55%">
                    <stop offset="0%" stopColor="#FF9A3C" />
                    <stop offset="100%" stopColor="#FF6B00" />
                </radialGradient>
                <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFB86A" />
                    <stop offset="100%" stopColor="#FF8C30" />
                </radialGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="eyeGrad" cx="35%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#E8E8E8" />
                </radialGradient>
                <radialGradient id="hornGrad" cx="50%" cy="20%" r="70%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="50" cy="96" rx="28" ry="5" fill="rgba(0,0,0,0.2)" />

            {/* Horns */}
            <path d="M 34 28 L 28 10 L 38 22" fill="url(#hornGrad)" stroke="#E8A000" strokeWidth="0.5" />
            <path d="M 66 28 L 72 10 L 62 22" fill="url(#hornGrad)" stroke="#E8A000" strokeWidth="0.5" />
            {/* Horn shine */}
            <ellipse cx="31" cy="17" rx="2" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-15 31 17)" />
            <ellipse cx="69" cy="17" rx="2" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(15 69 17)" />

            {/* Ears */}
            <ellipse cx="18" cy="52" rx="10" ry="14" fill="url(#bodyGrad)" />
            <ellipse cx="82" cy="52" rx="10" ry="14" fill="url(#bodyGrad)" />
            <ellipse cx="18" cy="52" rx="6" ry="10" fill="#FF9A3C" opacity="0.6" />
            <ellipse cx="82" cy="52" rx="6" ry="10" fill="#FF9A3C" opacity="0.6" />

            {/* Body */}
            <ellipse cx="50" cy="58" rx="32" ry="30" fill="url(#bodyGrad)" />

            {/* Face */}
            <ellipse cx="50" cy="50" rx="28" ry="26" fill="url(#faceGrad)" />

            {/* Snout */}
            <ellipse cx="50" cy="67" rx="13" ry="9" fill="#FF8040" opacity="0.7" />
            <ellipse cx="46" cy="66" rx="4" ry="3" fill="#CC5500" opacity="0.5" />
            <ellipse cx="54" cy="66" rx="4" ry="3" fill="#CC5500" opacity="0.5" />

            {/* Eyes */}
            <motion.g animate={{ scaleY: e.eyeScale }} style={{ transformOrigin: "42px 48px" }}>
                <circle cx="38" cy="48" r="9" fill="url(#eyeGrad)" />
                <circle cx="38" cy="48" r="6" fill="#1a1a2e" />
                <circle cx={e.pupils[0]} cy={e.pupils[1]} r="6" fill="#1a1a2e" />
                <circle cx="35" cy="45" r="2" fill="white" opacity="0.9" />
            </motion.g>

            {/* Wink for winking mood */}
            {mood === "winking" ? (
                <path d="M 55 45 Q 62 42 69 45" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
                <motion.g animate={{ scaleY: e.eyeScale }} style={{ transformOrigin: "62px 48px" }}>
                    <circle cx="62" cy="48" r="9" fill="url(#eyeGrad)" />
                    <circle cx="62" cy="48" r="6" fill="#1a1a2e" />
                    <circle cx="59" cy="45" r="2" fill="white" opacity="0.9" />
                </motion.g>
            )}

            {/* Eyebrows */}
            <motion.path
                d={`M 30 ${38 + e.browAngle} Q 38 ${35 + e.browAngle} 46 ${38 + e.browAngle}`}
                stroke="#CC5500" strokeWidth="2.5" strokeLinecap="round" fill="none"
                animate={{ d: `M 30 ${38 + e.browAngle} Q 38 ${35 + e.browAngle} 46 ${38 + e.browAngle}` }}
            />
            <motion.path
                d={`M 54 ${38 + e.browAngle} Q 62 ${35 + e.browAngle} 70 ${38 + e.browAngle}`}
                stroke="#CC5500" strokeWidth="2.5" strokeLinecap="round" fill="none"
                animate={{ d: `M 54 ${38 + e.browAngle} Q 62 ${35 + e.browAngle} 70 ${38 + e.browAngle}` }}
            />

            {/* Mouth */}
            <motion.path
                d={e.mouthPath}
                stroke="#CC5500" strokeWidth="2.5" strokeLinecap="round" fill="none"
                animate={{ d: e.mouthPath }}
                transition={{ duration: 0.3 }}
            />

            {/* Cheek blush */}
            <ellipse cx="24" cy="58" rx="6" ry="4" fill="#FF6060" opacity="0.3" />
            <ellipse cx="76" cy="58" rx="6" ry="4" fill="#FF6060" opacity="0.3" />

            {/* Shine on forehead */}
            <ellipse cx="44" cy="38" rx="6" ry="4" fill="rgba(255,255,255,0.25)" transform="rotate(-15 44 38)" />

            {/* Chart icon on body */}
            <rect x="38" y="72" width="24" height="14" rx="3" fill="rgba(255,255,255,0.15)" />
            <path d="M 41 82 L 44 77 L 48 80 L 52 74 L 56 78 L 59 75" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
    );
};
