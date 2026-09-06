import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, ChevronRight, RotateCcw, BookOpen, Heart, X, Users } from 'lucide-react';
import { Person } from '../types.ts';
import { EasterEggModal } from './EasterEggModal.tsx';

interface DirectoryScreenProps {
  people: Person[];
  selectedPersonId?: string;
  onSelectPerson: (person: Person) => void;
  onViewFinalScreen?: () => void;
  onViewIntro?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onClearSearch?: () => void;
}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  people,
  selectedPersonId,
  onSelectPerson,
  onViewFinalScreen,
  onViewIntro,
  searchQuery = '',
  onSearchChange,
  onClearSearch,
}) => {
  const [easterEggDismissed, setEasterEggDismissed] = useState(false);

  // Easter Egg detection
  const showEasterEgg = useMemo(() => {
    if (easterEggDismissed) return false;
    const cleaned = searchQuery.trim().toLowerCase();
    return cleaned === 'mugunthan' || cleaned === 'mugunth';
  }, [searchQuery, easterEggDismissed]);

  // Filtered colleagues based on searchQuery, ordered alphabetically (A-Z)
  const filteredPeople = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseList = q
      ? people.filter((p) => {
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesShort = p.shortName.toLowerCase().includes(q);
          const matchesRole = p.role.toLowerCase().includes(q);
          const matchesTeam = p.team ? p.team.toLowerCase().includes(q) : false;
          const matchesQuote = p.specialQuote ? p.specialQuote.toLowerCase().includes(q) : false;
          const matchesMemory = p.sharedMemory ? p.sharedMemory.toLowerCase().includes(q) : false;
          return matchesName || matchesShort || matchesRole || matchesTeam || matchesQuote || matchesMemory;
        })
      : [...people];

    return baseList.sort((a, b) => {
      if (a.id === 'general-team') return 1;
      if (b.id === 'general-team') return -1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [people, searchQuery]);

  const generalNotePerson = people.find((p) => p.id === 'general-team') || people[0];

  // Helper to color avatars by category
  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'Stakeholders':
        return 'from-blue-600/40 to-indigo-600/40 text-sky-200 border-sky-400/40';
      case 'Leadership':
        return 'from-violet-600/40 to-indigo-600/40 text-violet-200 border-violet-400/40';
      case 'Teammates & Friends':
        return 'from-cyan-600/40 to-sky-600/40 text-cyan-200 border-cyan-400/40';
      case 'Old Colleagues':
        return 'from-teal-600/40 to-emerald-600/40 text-teal-200 border-teal-400/40';
      default:
        return 'from-slate-700/50 to-slate-800/50 text-slate-200 border-slate-600/30';
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto z-20 px-4 sm:px-6 lg:px-12 py-8 sm:py-10 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="mb-6 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono tracking-[0.25em] text-cyan-400 uppercase font-semibold">
              ONE LAST WALK
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs font-mono text-slate-400">17 September 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight">
            Colleague Farewell Dashboard
          </h1>
          <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed font-light">
            Click any colleague&apos;s name (arranged in alphabetical order A–Z) to open their personal note. Mugunthan (Jerry Cartoon) will appear and read it aloud!
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {generalNotePerson && (
            <button
              id="view-general-team-note-btn"
              onClick={() => onSelectPerson(generalNotePerson)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-cyan-400/50 text-xs sm:text-sm text-slate-200 hover:text-white transition-colors shadow-sm shadow-black/40"
              title="Read collective farewell message for everyone"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>General Team Note</span>
            </button>
          )}
          {onViewFinalScreen && (
            <button
              id="view-final-reflection-btn"
              onClick={onViewFinalScreen}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs sm:text-sm text-cyan-200 hover:text-white transition-colors shadow-sm shadow-black/40"
            >
              <Heart className="w-4 h-4 text-cyan-400" />
              <span>Closing Thoughts</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Large Search Bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-2xl">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            id="prominent-colleague-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search your name..."
            className="w-full bg-[#050b1a]/90 border-2 border-cyan-500/30 hover:border-cyan-400/60 focus:border-cyan-400 rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-36 text-base sm:text-lg text-white placeholder:text-sky-200/50 shadow-xl shadow-black/60 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all font-sans backdrop-blur-xl"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-100 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 transition-colors flex items-center gap-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-xs font-mono text-cyan-200/90 px-2.5 py-1 rounded-lg bg-black/50 border border-cyan-500/30 hidden sm:inline">
              {filteredPeople.length} {filteredPeople.length === 1 ? 'colleague' : 'colleagues'} • A–Z
            </span>
          </div>
        </div>
      </div>

      {/* Active Search Notification if search query is active */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-200/90 mb-5 px-1">
          <span>
            Filtering colleagues matching &ldquo;<strong className="text-white">{searchQuery}</strong>&rdquo; ({filteredPeople.length} found)
          </span>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-cyan-300 hover:text-cyan-100 underline underline-offset-2 flex items-center gap-1 font-medium text-xs sm:text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show all {people.length}</span>
            </button>
          )}
        </div>
      )}

      {/* Dashboard Colleagues Grid */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-16">
          {filteredPeople.map((person, idx) => {
            const isSelected = selectedPersonId === person.id;
            const initials = person.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

            const colorClass = getCategoryColor(person.category);
            const previewSnippet =
              person.specialQuote ||
              (person.message && person.message[0] ? person.message[0] : '');

            return (
              <motion.div
                key={person.id}
                id={`colleague-card-${person.id}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => onSelectPerson(person)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer select-none transition-all duration-300 border backdrop-blur-xl ${
                  isSelected
                    ? 'bg-[#0c1833] border-cyan-400 shadow-2xl shadow-cyan-950/80 ring-2 ring-cyan-400/50'
                    : 'bg-[#050b1a]/85 hover:bg-[#0c1836]/95 border-cyan-500/25 hover:border-cyan-400/60 shadow-xl shadow-black/60 hover:shadow-cyan-950/50'
                }`}
              >
                {/* Top Row: Avatar & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    {/* Monogram Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-br border shadow-sm shrink-0 transition-transform group-hover:scale-105 ${colorClass}`}
                    >
                      {initials}
                    </div>

                    {/* Category Tag */}
                    <div className="flex flex-col items-end gap-1">
                      {person.category && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-sky-200/80 text-[10px] font-medium tracking-wide">
                          {person.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Colleague Name */}
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {person.name}
                  </h3>

                  {/* Role and Team */}
                  <p className="text-xs text-sky-300/90 font-medium uppercase tracking-wider mt-1 line-clamp-1">
                    {[person.role, person.team].filter(Boolean).join(' • ')}
                  </p>

                  {/* Message / Quote Preview */}
                  {previewSnippet && (
                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 italic leading-relaxed group-hover:text-white transition-colors">
                      &ldquo;{previewSnippet}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-cyan-400 group-hover:text-cyan-300 font-medium transition-colors">
                    <span className="text-sm">🐭</span>
                    <span className="text-[11px] font-mono">Read Aloud</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-slate-300 group-hover:text-white font-medium transition-colors">
                    <span>Open note</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-cyan-400" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#050b1a]/85 rounded-2xl border border-cyan-500/25 max-w-lg mx-auto my-8 shadow-xl shadow-black/60 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-300">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif text-white mb-2">No colleagues found</h3>
          <p className="text-sm text-sky-200/80 mb-6">
            We couldn&apos;t find anyone matching &ldquo;{searchQuery}&rdquo;.
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wider transition-all shadow-md shadow-cyan-950/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show all colleagues</span>
            </button>
          )}
        </div>
      )}

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <EasterEggModal onClose={() => setEasterEggDismissed(true)} />
      )}
    </div>
  );
};
