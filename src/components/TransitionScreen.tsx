import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface TransitionScreenProps {
  onContinue: () => void;
}

export const TransitionScreen: React.FC<TransitionScreenProps> = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.9 }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 z-10 select-none"
    >
      <div className="max-w-xl w-full text-center space-y-10 my-auto py-12">
        {/* Subtle accent icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center bg-[#050b1a]/90 backdrop-blur-md shadow-lg shadow-black/80"
        >
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </motion.div>

        {/* Narrative lines revealed with calculated pacing */}
        <div className="space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light tracking-wide font-serif italic"
          >
            I could have written a farewell email…
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-2xl md:text-3xl text-white font-light tracking-wide font-serif"
          >
            But some people deserve more than a <span className="text-cyan-400 font-medium">CC list</span>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-sky-200 font-light tracking-wider pt-2"
          >
            So I left something here for each of you.
          </motion.p>
        </div>

        {/* Continue Action */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.2 }}
          className="pt-6"
        >
          <button
            id="find-message-btn"
            onClick={onContinue}
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#07132a] via-[#0e234c] to-[#07132a] border border-cyan-400/40 hover:border-cyan-300 text-cyan-100 hover:text-white font-medium tracking-[0.2em] text-xs uppercase transition-all duration-300 shadow-xl shadow-black/80 hover:shadow-cyan-500/25"
          >
            <span>Find Your Message</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      {/* Subtle quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 4.5, duration: 1 }}
        className="text-[11px] tracking-[0.25em] text-slate-500 uppercase pb-6"
      >
        Personalized Notes • 17.09.2026
      </motion.div>
    </motion.div>
  );
};
