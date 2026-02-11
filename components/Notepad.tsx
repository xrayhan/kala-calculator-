
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Save, FileText, Menu, X, ChevronRight } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

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
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(20);
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
    <div className="flex-1 bg-white/5 rounded-3xl shadow-2xl border border-white/5 flex flex-col h-full overflow-hidden backdrop-blur-xl">
      <div className="flex h-full relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && window.innerWidth < 768 && (
          <div className="absolute inset-0 bg-black/80 z-40 animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`
          absolute md:relative z-50 h-full transition-all duration-300 ease-in-out border-r border-white/5 bg-[#020617] flex flex-col
          ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:w-0'}
        `}>
          <div className="p-5 border-b border-white/5 flex items-center justify-between overflow-hidden shrink-0">
            <h3 className="font-black text-slate-200 flex items-center gap-2 whitespace-nowrap text-xs uppercase tracking-widest">
              <FileText size={14} className="text-indigo-500" /> Files
            </h3>
            <button onClick={handleNewNote} className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-900/40">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pt-2">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full text-left p-4 rounded-2xl mb-2 transition-all flex items-center justify-between group ${
                  activeNoteId === note.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-200 truncate text-sm">{note.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-1">{note.content.substring(0, 30)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="p-2 text-rose-500/40 hover:text-rose-500 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
            {notes.length === 0 && (
              <div className="py-20 text-center opacity-20 px-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={24} />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Database Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/10">
          <div className="p-3 md:p-4 border-b border-white/5 flex items-center gap-3 sticky top-0 bg-[#0f172a]/80 backdrop-blur-xl z-20 shrink-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-slate-300 bg-white/5 rounded-xl md:hover:bg-white/10 active:scale-95 transition-transform"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Note title..."
                className="w-full text-base font-black bg-transparent text-white placeholder:text-slate-700 focus:outline-none tracking-tight"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleAiSummarize}
                disabled={!localContent || isAiLoading}
                className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 disabled:opacity-30 active:scale-95 transition-transform"
              >
                <Sparkles size={18} className={isAiLoading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={handleSave}
                className="p-2.5 rounded-xl bg-white text-black font-black hover:bg-slate-200 active:scale-95 transition-transform"
              >
                <Save size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col h-full overflow-hidden">
            <textarea
              placeholder="Start drafting..."
              className="flex-1 p-5 md:p-8 bg-transparent text-slate-300 leading-relaxed focus:outline-none resize-none h-full text-sm md:text-base font-medium selection:bg-indigo-500/30"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
            />
            
            {aiSummary && (
              <div className="absolute inset-x-0 bottom-0 max-h-[60%] bg-[#020617] border-t border-indigo-500/30 p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-black text-indigo-400 text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles size={12} /> Intelligence Report
                  </h5>
                  <button onClick={() => setAiSummary('')} className="p-1.5 text-slate-500 hover:text-white bg-white/5 rounded-lg"><X size={14} /></button>
                </div>
                <div className="text-xs md:text-sm text-slate-400 leading-relaxed font-medium whitespace-pre-wrap border-l-2 border-indigo-500/20 pl-4 py-2">
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
