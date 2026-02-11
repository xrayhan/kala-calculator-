
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Save, FileText, Menu, X } from 'lucide-react';
import { Note } from '../types';
import { summarizeNotes } from '../services/geminiService';

interface NotepadProps {
  notes: Note[];
  onSave: (note: Partial<Note>) => void;
  onDelete: (id: string) => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}

const Notepad: React.FC<NotepadProps> = ({ notes, onSave, onDelete, activeNoteId, setActiveNoteId }) => {
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
      setAiSummary('');
    } else {
      setLocalTitle('');
      setLocalContent('');
      setAiSummary('');
    }
  }, [activeNoteId]);

  const handleSave = () => {
    if (!localTitle && !localContent) return;
    onSave({
      id: activeNoteId || undefined,
      title: localTitle || 'Untitled Note',
      content: localContent,
    });
  };

  const handleNewNote = () => {
    setActiveNoteId(null);
    setLocalTitle('');
    setLocalContent('');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleAiSummarize = async () => {
    if (!localContent) return;
    setIsAiLoading(true);
    const summary = await summarizeNotes(localContent);
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  return (
    <div className="flex-1 bg-slate-900/40 rounded-3xl shadow-2xl border border-slate-800 flex flex-col h-full overflow-hidden backdrop-blur-sm">
      <div className="flex h-full relative">
        {/* Sidebar */}
        <div className={`
          absolute md:relative z-30 h-full transition-all duration-300 border-r border-slate-800 bg-slate-950
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0'}
        `}>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between overflow-hidden">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 whitespace-nowrap">
              <FileText size={18} className="text-indigo-500" /> My Notes
            </h3>
            <button onClick={handleNewNote} className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-hidden">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-4 border-b border-slate-800/50 transition-colors group relative ${
                  activeNoteId === note.id ? 'bg-slate-900/80' : 'hover:bg-slate-900/40'
                }`}
              >
                <h4 className="font-semibold text-slate-300 truncate pr-6">{note.title}</h4>
                <p className="text-xs text-slate-500 truncate">{note.content.substring(0, 40)}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/20">
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 sticky top-0 bg-slate-900/60 backdrop-blur-md z-20">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Title..."
                className="w-full text-lg font-bold bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleAiSummarize}
                disabled={!localContent || isAiLoading}
                className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 disabled:opacity-30"
              >
                <Sparkles size={20} />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 rounded-xl bg-slate-100 text-slate-900 font-bold hover:bg-white transition-all"
              >
                <Save size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col md:flex-row h-full overflow-hidden">
            <textarea
              placeholder="Start writing..."
              className="flex-1 p-6 bg-transparent text-slate-300 leading-relaxed focus:outline-none resize-none h-full"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
            />
            
            {aiSummary && (
              <div className="w-full md:w-80 bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 p-6 overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-bold text-indigo-400 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} /> AI Analysis
                  </h5>
                  <button onClick={() => setAiSummary('')} className="text-slate-600 hover:text-slate-400"><X size={16} /></button>
                </div>
                <div className="text-sm text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                   {aiSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notepad;
