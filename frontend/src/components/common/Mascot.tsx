import React from 'react';

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

    return (
        <div
            className={`mascot-container relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src={imageSource}
                alt={`${alt} - ${pose}`}
                className="w-full h-full object-contain transition-all duration-300 ease-in-out hover:scale-105"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
            />
        </div>
    );
};

export default Mascot;
