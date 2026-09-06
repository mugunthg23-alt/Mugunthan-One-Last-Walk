import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface EasterEggModalProps {
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full rounded-2xl bg-[#0c0512] border border-rose-400/40 p-8 text-center shadow-2xl shadow-rose-950/60 relative overflow-hidden"
      >
        <div
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: '#f43f5e' }}
        />

        <div className="mx-auto w-12 h-12 rounded-full border border-rose-400/30 bg-rose-950/40 flex items-center justify-center mb-5 text-rose-300">
          <Sparkles className="w-5 h-5" />
        </div>

        <h3 className="font-serif text-2xl text-white mb-3 tracking-wide font-bold">
          Nice try.
        </h3>

        <p className="text-rose-100/90 text-sm leading-relaxed mb-2 font-light">
          This page wasn’t supposed to be about me.
        </p>

        <p className="text-cyan-300 font-medium text-sm tracking-wide mb-6">
          Today is about thanking you.
        </p>

        <button
          id="easter-egg-close-btn"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-xs uppercase tracking-widest text-rose-200 hover:text-white border border-rose-400/30 hover:border-rose-400/60 transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Colleagues</span>
        </button>
      </motion.div>
    </div>
  );
};
