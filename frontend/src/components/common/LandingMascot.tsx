import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotExpression, MascotMood } from './TradingMascot';
import { useNavigate } from 'react-router-dom';

/* ─── MASCOT BUBBLE ─── */
const MascotBubble = ({ text, visible }: { text: string; visible: boolean }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 10, originX: 1, originY: 1 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute bottom-full right-4 mb-3 bg-gradient-to-br from-[#1a1a30] to-[#0f0f1a] border-[1.5px] border-primary/40 rounded-2xl px-4 py-3 min-w-[200px] max-w-[260px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,113,0,0.1)] z-50 pointer-events-none"
            >
                <div className="absolute -bottom-2.5 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-primary/40" />
                <div className="absolute -bottom-2 right-[26px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#1a1a30]" />
                <p className="m-0 text-white text-[13px] leading-relaxed font-medium text-center">
                    {text}
                </p>
            </motion.div>
        )}
    </AnimatePresence>
);

const messages: { mood: MascotMood; text: string }[] = [
    { mood: "excited", text: "🎯 Paper trading = zero risk, maximum learning!" },
    { mood: "confident", text: "📈 Over 50,000 traders trust our AI signals!" },
    { mood: "happy", text: "🤖 Our AI analyses 1M+ data points per second!" },
    { mood: "thinking", text: "💡 Start with ₹10L virtual money — no strings attached!" },
    { mood: "winking", text: "🏆 Top traders earn real rewards on the leaderboard!" },
    { mood: "excited", text: "🚀 Join today — your first masterclass is FREE!" },
];

const LandingMascot = () => {
    const [msgIdx, setMsgIdx] = useState(0);
    const [bubbleVisible, setBubbleVisible] = useState(true);
    const [clicked, setClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cycle = () => {
            setBubbleVisible(false);
            setTimeout(() => {
                setMsgIdx(i => (i + 1) % messages.length);
                setBubbleVisible(true);
            }, 500);
        };
        const id = setInterval(cycle, 5000);
        return () => clearInterval(id);
    }, []);

    const handleClick = () => {
        setClicked(true);
        setBubbleVisible(false);
        setTimeout(() => {
            // cycle manually on click or go to login?
            // User requested guidance, clicking can navigate to login representing "sign up" or just show next tip.
            // Let's cycle tips on click
            setMsgIdx(i => (i + 1) % messages.length);
            setBubbleVisible(true);
            setClicked(false);
        }, 300);
    };

    if (!isVisible) return null;
    const { mood, text } = messages[msgIdx];

    return (
        <motion.div
            className="fixed bottom-8 right-8 z-[999] cursor-pointer select-none"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 2 }}
            onClick={handleClick}
        >
            <MascotBubble text={text} visible={bubbleVisible} />

            <button
                onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                className="absolute top-0 right-0 bg-black/50 text-white/50 hover:bg-red-500 hover:text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity z-20 m-1"
                aria-label="Close"
            >
                ✕
            </button>

            <motion.div
                animate={{
                    y: [0, -8, 0],
                    rotate: clicked ? [0, -10, 10, 0] : [0, 2, -2, 0],
                }}
                transition={{
                    y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    rotate: clicked
                        ? { duration: 0.4 }
                        : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ scale: 1.1 }}
                className="drop-shadow-[0_8px_24px_rgba(255,113,0,0.5)]"
            >
                <MascotExpression mood={mood} size={90} />
            </motion.div>

            {/* Ground Shadow */}
            <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70px] h-[20px] bg-[radial-gradient(ellipse,rgba(255,113,0,0.4)_0%,transparent_70%)] rounded-full -z-10 pointer-events-none"
            />
        </motion.div>
    );
};

export default LandingMascot;
