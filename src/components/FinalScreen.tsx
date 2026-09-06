import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Users } from 'lucide-react';

interface FinalScreenProps {
  onReturnToDirectory: () => void;
  onReplayIntro: () => void;
}

const MEMORY_WORDS = [
  'Meetings',
  'UATs',
  'Deadlines',
  'Calls',
  'Coffee',
  'Problems',
  'Solutions',
  'Launches',
  'Learning',
  'Laughs',
  'Memories',
];

export const FinalScreen: React.FC<FinalScreenProps> = ({
  onReturnToDirectory,
  onReplayIntro,
}) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    const t0 = setTimeout(() => setStage(1), 3200);
    const t1 = setTimeout(() => setStage(2), 7500);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  return (
    <div className="relative h-full w-full flex flex-col items-center p-4 sm:p-8 md:p-12 z-20 select-none text-center overflow-y-auto">
      {/* Radial ambient glow from Immersive UI */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.06)_0%,_transparent_70%)] pointer-events-none" />

      {/* Prominent Top Action Buttons - Brought to the top of the page */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto flex items-center justify-center gap-3 pt-2 pb-6 z-30 shrink-0"
      >
        <button
          id="return-to-directory-btn-top"
          onClick={onReturnToDirectory}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400/50 hover:border-cyan-300 text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white transition-all duration-300 shadow-xl shadow-black/40 font-medium"
        >
          <Users className="w-3.5 h-3.5 text-cyan-300" />
          <span>Return to Notes</span>
        </button>

        <button
          id="replay-experience-btn-top"
          onClick={onReplayIntro}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:border-white/40 text-xs uppercase tracking-[0.2em] text-slate-200 hover:text-white transition-all duration-300 shadow-xl shadow-black/40 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay Experience</span>
        </button>
      </motion.div>

      <div className="max-w-3xl w-full min-h-[420px] flex-1 flex flex-col items-center justify-center relative z-20 my-auto">
        <AnimatePresence mode="wait">
          {/* Stage 0: Introductory acknowledgment */}
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-xl mx-auto"
            >
              <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-transparent mx-auto mb-6" />

              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-medium font-mono">
                Before you leave…
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-light leading-relaxed">
                Thank you for the meetings, deadlines, calls, debates, ideas, support, lessons and memories.
              </h2>
            </motion.div>
          )}

          {/* Stage 1: Floating memory words gently appearing and drifting */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
              transition={{ duration: 1.0 }}
              className="relative w-full max-w-2xl py-10 flex flex-wrap justify-center items-center gap-3 sm:gap-4"
            >
              {MEMORY_WORDS.map((word, idx) => {
                const delay = idx * 0.15;
                const isHighlight = ['Coffee', 'Launches', 'Memories', 'Laughs'].includes(word);

                return (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-serif tracking-wider transition-all ${
                      isHighlight
                        ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-medium shadow-lg shadow-cyan-950/40'
                        : 'bg-white/[0.04] border border-white/10 text-slate-200'
                    }`}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.div>
          )}

          {/* Stage 2: The Final Anthem & Farewell Signature */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 max-w-2xl mx-auto"
            >
              <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-transparent mx-auto mb-6" />

              <div className="space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.9 }}
                  className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white uppercase tracking-[0.14em] leading-tight"
                >
                  Different Desks.
                </motion.h1>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.9 }}
                  className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-slate-200 uppercase tracking-[0.14em] leading-tight"
                >
                  Different Journeys.
                </motion.h1>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.9 }}
                  className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-sky-300 uppercase tracking-[0.14em] leading-tight"
                >
                  One Chapter We Shared.
                </motion.h1>
              </div>

              {/* Thank you + Date + Name */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.9 }}
                className="space-y-4 pt-4"
              >
                <p className="font-serif text-2xl sm:text-3xl text-slate-200 font-light italic">
                  Thank you.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs uppercase tracking-[0.25em] text-cyan-400 font-mono">
                  <span className="font-semibold text-cyan-300">ONE LAST WALK</span>
                  <span>•</span>
                  <span>17.09.2026</span>
                  <span>•</span>
                  <span className="font-serif text-sm normal-case tracking-wider text-white font-medium">
                    Mugunthan
                  </span>
                </div>

                <p className="text-xs text-sky-200/70 font-light tracking-[0.2em] italic pt-2">
                  Until our paths cross again.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
                className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <button
                  id="return-to-directory-btn"
                  onClick={onReturnToDirectory}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white transition-all duration-300 shadow-lg shadow-cyan-950/40 font-medium"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Return to Notes</span>
                </button>

                <button
                  id="replay-experience-btn"
                  onClick={onReplayIntro}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-xs uppercase tracking-[0.2em] text-slate-200 hover:text-white transition-all duration-300 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Experience</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button during stages 0 & 1 */}
      {stage < 2 && (
        <button
          onClick={() => setStage(2)}
          className="absolute bottom-6 text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors py-1 px-3 z-20"
        >
          Skip to closing →
        </button>
      )}

      {/* Background large decorative watermark */}
      <div className="absolute bottom-8 right-8 text-[70px] sm:text-[100px] lg:text-[120px] font-serif italic opacity-[0.03] select-none pointer-events-none whitespace-nowrap">
        One Last Walk
      </div>
    </div>
  );
};
