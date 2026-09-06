import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Person } from '../types.ts';
import { exportPeopleJson, generatePersonSlug, resetToDefaultPeople, savePeople, sortPeopleAlphabetically } from '../data/peopleService.ts';

interface AdminScreenProps {
  people: Person[];
  onUpdatePeople: (updated: Person[]) => void;
  onExitAdmin: () => void;
  onPreviewPerson: (person: Person) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  people,
  onUpdatePeople,
  onExitAdmin,
  onPreviewPerson,
}) => {
  const [selectedId, setSelectedId] = useState<string>(people[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedJson, setCopiedJson] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active person being edited
  const activePerson = people.find((p) => p.id === selectedId) || people[0];

  const handleFieldChange = <K extends keyof Person>(key: K, value: Person[K]) => {
    if (!activePerson) return;
    const updated = people.map((p) => {
      if (p.id === activePerson.id) {
        return { ...p, [key]: value };
      }
      return p;
    });
    onUpdatePeople(updated);
    savePeople(updated);
    flashSave();
  };

  const handleParagraphsChange = (text: string) => {
    const paragraphs = text
      .split('\n\n')
      .map((t) => t.trim())
      .filter(Boolean);
    handleFieldChange('message', paragraphs.length > 0 ? paragraphs : [text]);
  };

  const handleAddNew = () => {
    const newName = 'New Colleague';
    const newPerson: Person = {
      id: generatePersonSlug(newName),
      name: newName,
      shortName: 'Colleague',
      role: 'Team Member',
      team: 'Engineering',
      category: 'Technology',
      featured: false,
      message: [
        'Thank you for being such an incredible teammate throughout this chapter.',
        'Your support and collaboration made every challenge easier to tackle.',
      ],
    };

    const updated = sortPeopleAlphabetically([newPerson, ...people]);
    onUpdatePeople(updated);
    savePeople(updated);
    setSelectedId(newPerson.id);
    flashSave();
  };

  const handleDelete = (id: string) => {
    if (people.length <= 1) {
      alert('You must keep at least one person entry.');
      return;
    }
    if (confirm('Are you sure you want to remove this person?')) {
      const updated = people.filter((p) => p.id !== id);
      onUpdatePeople(updated);
      savePeople(updated);
      setSelectedId(updated[0].id);
      flashSave();
    }
  };

  const handleReset = () => {
    if (confirm('Reset all colleague messages back to original placeholders? Any unsaved local edits will be reset.')) {
      const def = resetToDefaultPeople();
      onUpdatePeople(def);
      setSelectedId(def[0].id);
      flashSave();
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportPeopleJson(people);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      const jsonStr = exportPeopleJson(people);
      await navigator.clipboard.writeText(jsonStr);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } catch {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    }
  };

  const flashSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen w-full flex flex-col z-20 bg-[#05070b] text-slate-200"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#080c14]/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Editor</span>
          </button>
          <div>
            <h1 className="text-base font-medium text-slate-100 flex items-center gap-2">
              <span>Colleague Messages Manager</span>
              {saveSuccess && (
                <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved locally
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Manage personalized notes for 17 September 2026. Export people.json when done.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
            title="Copy JSON to clipboard"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-[#e5c378] hover:bg-[#d6b162] text-[#05070b] font-medium transition-all shadow-md shadow-[#e5c378]/20"
            title="Download people.json file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export people.json</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-rose-900/50"
            title="Reset to default placeholder colleagues"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout: 2 Columns (List + Editor) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Colleague List */}
        <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col bg-[#070a12]">
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Colleagues ({people.length})
              </span>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/60 text-blue-300 hover:bg-blue-900/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Person</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by name or role..."
                className="w-full bg-[#0d121f] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-md border border-slate-800 focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-850 max-h-[calc(100vh-170px)]">
            {filteredPeople.map((person) => (
              <div
                key={person.id}
                onClick={() => setSelectedId(person.id)}
                className={`p-3.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  activePerson?.id === person.id
                    ? 'bg-[#12192a] border-l-2 border-[#e5c378]'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {person.name}
                    </span>
                    {person.featured && (
                      <Sparkles className="w-3 h-3 text-[#e5c378] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {person.role || 'No role'}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(person.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  title="Delete person"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Editor Form & Live Preview */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-h-[calc(100vh-70px)] bg-[#05070b]">
          {activePerson ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header with Preview Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-serif text-slate-100">
                    Editing note for {activePerson.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    ID / URL slug: <code className="text-[#e5c378] bg-slate-900 px-1.5 py-0.5 rounded">{activePerson.id}</code>
                  </p>
                </div>

                <button
                  onClick={() => onPreviewPerson(activePerson)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg bg-[#111726] border border-[#e5c378]/40 hover:border-[#e5c378] text-[#e5c378] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Cinematic Note</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={activePerson.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    Short / Display Name
                  </label>
                  <input
                    type="text"
                    value={activePerson.shortName}
                    onChange={(e) => handleFieldChange('shortName', e.target.value)}
                    className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={activePerson.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
                    className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    Team / Department
                  </label>
                  <input
                    type="text"
                    value={activePerson.team || ''}
                    onChange={(e) => handleFieldChange('team', e.target.value)}
                    placeholder="e.g. Core Engineering, Design Studio..."
                    className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                    Category (Optional Filter)
                  </label>
                  <select
                    value={activePerson.category || 'Colleagues'}
                    onChange={(e) => handleFieldChange('category', e.target.value as any)}
                    className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Stakeholders">Stakeholders</option>
                    <option value="Teammates & Friends">Teammates & Friends</option>
                    <option value="Colleagues">Colleagues</option>
                    <option value="Old Colleagues">Old Colleagues</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="relative flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!activePerson.featured}
                      onChange={(e) => handleFieldChange('featured', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#e5c378] focus:ring-0"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200">
                        Mark as Featured Collaborator
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Adds subtle golden aura and special tribute banner.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special Quote */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Optional Quote / Philosophy
                </label>
                <input
                  type="text"
                  value={activePerson.specialQuote || ''}
                  onChange={(e) => handleFieldChange('specialQuote', e.target.value)}
                  placeholder="e.g. Some people don't just become colleagues. They become part of the journey."
                  className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                />
              </div>

              {/* Shared Memory */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Optional Shared Memory Line
                </label>
                <input
                  type="text"
                  value={activePerson.sharedMemory || ''}
                  onChange={(e) => handleFieldChange('sharedMemory', e.target.value)}
                  placeholder="e.g. The late evening release sanity tests and cafeteria filter coffee."
                  className="w-full bg-[#0d121f] text-sm text-slate-100 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60"
                />
              </div>

              {/* Message Paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Personal Thank-You Message
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Separate paragraphs with a blank line
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={activePerson.message.join('\n\n')}
                  onChange={(e) => handleParagraphsChange(e.target.value)}
                  className="w-full bg-[#0d121f] text-sm leading-relaxed text-slate-100 p-3.5 rounded-lg border border-slate-800 focus:outline-none focus:border-[#e5c378]/60 font-sans"
                  placeholder="Write your heartfelt note here..."
                />
              </div>

              {/* Direct share link info */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">Direct Colleague Link:</p>
                <p>
                  You can share <code className="text-[#e5c378]">?to={activePerson.id}</code> to send this colleague straight to their personal note.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              No colleague selected.
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};
