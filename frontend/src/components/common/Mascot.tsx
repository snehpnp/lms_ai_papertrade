import React from 'react';
import { cn } from "@/lib/utils";

export type MascotPose =
    | 'neutral'
    | 'explaining'
    | 'encouraging'
    | 'thinking'
    | 'celebration'
    | 'dark_mode';

interface MascotProps {
    pose?: MascotPose;
    size?: number | string;
    className?: string;
    alt?: string;
}

/**
 * Mascot component for the AI Mentor (Owl).
 * Displays the mascot in different functional poses.
 */
const Mascot: React.FC<MascotProps> = ({
    pose = 'neutral',
    size = 150,
    className = '',
    alt = 'AI Mentor Owl'
}) => {
    const imageSource = `/mascot/${pose}.png`;

    // Dynamic animation mapping
    const getAnimationClass = () => {
        switch (pose) {
            case 'celebration': return 'animate-mascot-wiggle';
            case 'thinking': return 'animate-mascot-breath';
            case 'explaining': return 'animate-mascot-float';
            case 'encouraging': return 'animate-mascot-float';
            default: return 'animate-mascot-float opacity-90';
        }
    };

    return (
        <div
            className={cn(
                "mascot-container relative flex items-center justify-center transition-all duration-500",
                getAnimationClass(),
                className
            )}
            style={{ width: size, height: size }}
        >
            <img
                src={imageSource}
                alt={`${alt} - ${pose}`}
                className="w-full h-full object-contain drop-shadow-2xl"
            />
        </div>
    );
};

export default Mascot;
