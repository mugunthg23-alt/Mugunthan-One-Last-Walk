import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onEnter: () => void;
  onSkip: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter, onSkip }) => {
  // Step 1: "I could have written a farewell email…"
  // Step 2: "But some people deserve more than a CC list."
  // Step 3: "So I left something here for each of you." + Action Button
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 1600);
    const t2 = setTimeout(() => setStep(3), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 select-none z-10">
      {/* Skip button for quick access */}
      <motion.button
        id="skip-intro-btn"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        onClick={onSkip}
        className="absolute top-6 left-6 md:top-8 md:left-8 text-xs tracking-widest text-slate-300 hover:text-cyan-200 uppercase transition-opacity duration-300 py-1.5 px-3 rounded-full border border-cyan-500/30 hover:border-cyan-400/50 bg-black/60 backdrop-blur-md"
      >
        Skip Intro →
      </motion.button>

      {/* Subtle cosmic glow behind text */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.15) 45%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="max-w-xl w-full text-center space-y-8 my-auto py-12 relative z-10">
        {/* Subtle accent icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center bg-[#050b1a]/90 backdrop-blur-md shadow-xl shadow-black/80"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </motion.div>

        {/* Narrative lines revealed with calculated pacing */}
        <div className="space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light tracking-wide font-serif italic"
          >
            I could have written a farewell email…
          </motion.p>

          <AnimatePresence>
            {step >= 2 && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl sm:text-2xl md:text-3xl text-white font-light tracking-wide font-serif"
              >
                But some people deserve more than a{' '}
                <span className="text-cyan-400 font-medium">CC list</span>.
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {step >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-sky-200 font-light tracking-wider pt-2"
              >
                So I left something here for each of you.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Continue Action Button */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pt-6"
            >
              <button
                id="find-message-btn"
                onClick={onEnter}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#07132a] via-[#0e234c] to-[#07132a] border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 hover:text-white font-medium tracking-[0.2em] text-xs uppercase transition-all duration-300 shadow-xl shadow-black/80 hover:shadow-cyan-500/25"
              >
                <span>Find Your Message</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Understated bottom watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 text-[11px] tracking-[0.25em] text-sky-200/60 uppercase pb-2 font-mono"
      >
        ONE LAST WALK • Mugunthan • 17.09.2026
      </motion.div>
    </div>
  );
};
