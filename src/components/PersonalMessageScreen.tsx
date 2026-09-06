import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Share2, Check, Sparkles, BookOpen, Quote, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Person } from '../types.ts';

interface PersonalMessageScreenProps {
  person: Person;
  activeParagraphIndex?: number;
  onTriggerMugunthanRead?: () => void;
  onBack: () => void;
  onReset?: () => void;
  onPrevPerson?: () => void;
  onNextPerson?: () => void;
  onNextScreen: () => void;
}

export const PersonalMessageScreen: React.FC<PersonalMessageScreenProps> = ({
  person,
  activeParagraphIndex = -1,
  onTriggerMugunthanRead,
  onBack,
  onReset,
  onPrevPerson,
  onNextPerson,
  onNextScreen,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('to', person.id);
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isFeatured = !!person.featured;

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-start p-4 sm:p-8 lg:p-14 overflow-y-auto z-20">
      {/* Subtle radial light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top Navigation Bar with Back, Reset, and Navigation controls */}
      <div className="max-w-2xl w-full flex flex-wrap items-center justify-between gap-3 mb-8 z-20 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Back to Dashboard Button */}
          <button
            id="back-to-dashboard-btn"
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold text-slate-300 hover:text-white transition-colors py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-sm"
            title="Back to colleagues dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Reset Selection Button */}
          {onReset && (
            <button
              id="reset-selection-btn"
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-cyan-300 hover:text-cyan-200 transition-colors py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/25"
              title="Reset selection and view all colleagues"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Controls: Prev/Next colleague + Share Link */}
        <div className="flex items-center gap-2">
          {onPrevPerson && (
            <button
              onClick={onPrevPerson}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Previous Colleague"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {onNextPerson && (
            <button
              onClick={onNextPerson}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Next Colleague"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            id="copy-personal-link-btn"
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider text-slate-300 hover:text-cyan-300 transition-colors py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            title="Copy direct link for this note"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Letter Card */}
      <div className="max-w-2xl w-full z-20 relative bg-[#050b1a]/92 border border-cyan-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl">
        {/* Featured Tag */}
        {isFeatured && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] uppercase tracking-wider font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Special Chapter Collaborator</span>
          </motion.div>
        )}

        {/* Colleague Name Header and Read Aloud Button */}
        <div className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl font-serif text-white mb-2 tracking-wide font-bold"
          >
            {person.name}
          </motion.h1>

          {(person.role || person.team || person.category) && (
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-sky-300/90 mb-4 font-mono font-medium">
              <span>{[person.role, person.team].filter(Boolean).join(' • ')}</span>
              {person.category && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-sky-200/80 text-[10px]">
                  {person.category}
                </span>
              )}
            </div>
          )}

          {/* Action Row with Mugunthan Voice Reader Trigger */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-white/10">
            <div
              className={`w-14 h-1 rounded-full ${
                isFeatured
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent'
                  : 'bg-gradient-to-r from-cyan-400 to-transparent'
              }`}
            />

            {onTriggerMugunthanRead && (
              <button
                id="listen-mugunthan-jerry-btn"
                onClick={onTriggerMugunthanRead}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 group scale-100 hover:scale-105 active:scale-95"
                title="Listen to Jerry cartoon Mugunthan read this message aloud"
              >
                <span className="text-base group-hover:rotate-12 transition-transform">🐭</span>
                <span>Listen to Mugunthan (Jerry) Read Aloud</span>
              </button>
            )}
          </div>
        </div>

        {/* Special Quote */}
        {person.specialQuote && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 p-4 rounded-xl border border-cyan-400/30 bg-cyan-950/40 text-cyan-100 text-sm sm:text-base italic font-serif leading-relaxed flex items-start gap-3"
          >
            <Quote className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>&ldquo;{person.specialQuote}&rdquo;</span>
          </motion.div>
        )}

        {/* Personal Message Paragraphs */}
        <div className="space-y-6 text-base sm:text-lg leading-relaxed text-slate-100 font-light font-sans">
          {person.message.map((paragraph, index) => {
            const isCurrentlyReading = activeParagraphIndex === index;
            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                className={`transition-all duration-300 ${
                  isCurrentlyReading
                    ? 'text-white bg-cyan-500/20 -mx-3 p-3.5 rounded-xl border border-cyan-400/50 shadow-md shadow-cyan-950/40 font-normal'
                    : ''
                }`}
              >
                {paragraph}
              </motion.p>
            );
          })}
        </div>

        {/* Shared Memory Callout */}
        {person.sharedMemory && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 p-4 rounded-xl border border-cyan-500/25 bg-cyan-950/30 flex items-start gap-3 text-xs sm:text-sm text-slate-200"
          >
            <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold">Memorable moment: </span>
              <span className="italic text-sky-100">{person.sharedMemory}</span>
            </div>
          </motion.div>
        )}

        {/* Signature & Closing */}
        <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold mb-1">
              With gratitude,
            </div>
            <div className="text-2xl font-serif italic text-white font-bold">
              — Mugunthan
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              id="before-you-leave-btn"
              onClick={onNextScreen}
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-cyan-200 hover:text-white transition-colors group py-2 px-4 rounded-xl border border-cyan-400/30 hover:border-cyan-400/60 bg-cyan-500/10 hover:bg-cyan-500/20"
            >
              <span>Closing thoughts</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
