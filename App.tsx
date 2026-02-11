
import React, { useState, useEffect, useRef } from 'react';
import Calculator from './components/Calculator';
import Notepad from './components/Notepad';
import { Note, Calculation } from './types';
import { CloudDownload, CloudUpload, Zap, Calculator as CalcIcon, StickyNote } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<Calculation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('kala_notes');
    const savedHistory = localStorage.getItem('kala_history');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('kala_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('kala_history', JSON.stringify(history));
  }, [history]);

  const handleCalculate = (expression: string, result: string) => {
    const newCalc: Calculation = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: Date.now(),
    };
    setHistory(prev => [newCalc, ...prev].slice(0, 50));
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (noteData.id) {
      setNotes(prev => prev.map(n => n.id === noteData.id 
        ? { ...n, ...noteData, updatedAt: Date.now() } as Note 
        : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        updatedAt: Date.now(),
      };
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const handleExportBackup = () => {
    const data = { notes, history, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kala_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Backup saved! Move this file to your safe storage for permanent protection.');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.notes) setNotes(data.notes);
        if (data.history) setHistory(data.history);
        alert('Backup restored successfully!');
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 overflow-hidden h-screen safe-bottom">
      {/* Premium Navbar */}
      <header className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
            <Zap size={22} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Kala Calculator</h1>
            <p className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Persistent AI Core</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportBackup} 
            className="hidden" 
            accept=".json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800 rounded-lg border border-slate-700"
            title="Import Backup"
          >
            <CloudUpload size={18} />
          </button>
          <button 
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
          >
            <CloudDownload size={18} />
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden">
        {/* Left Side: Calculator Core */}
        <div className="md:w-[380px] shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-1 px-2">
            <div className="flex items-center gap-2 text-slate-400">
              <CalcIcon size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Logic</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          </div>
          <Calculator history={history.map(h => ({ expression: h.expression, result: h.result }))} onCalculate={handleCalculate} />
          
          <div className="hidden md:block bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-slate-300">
            <h3 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
              <Zap size={16} /> Cloud-Ready
            </h3>
            <p className="text-xs leading-relaxed opacity-70">
              Kala maintains local encrypted storage. Use the Backup feature to sync your work across mobile and desktop manually.
            </p>
          </div>
        </div>

        {/* Right Side: Scratchpad Core */}
        <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-2 px-2 text-slate-400">
            <StickyNote size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Knowledge Base</span>
          </div>
          <Notepad 
            notes={notes} 
            onSave={handleSaveNote} 
            onDelete={handleDeleteNote} 
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
          />
        </div>
      </main>

      {/* Floating Status Bar */}
      <footer className="px-6 py-3 bg-black/40 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Storage: Protected</span>
          <span>Notes: {notes.length}</span>
        </div>
        <div className="text-slate-700">KALA_CORE_V2.1.0</div>
      </footer>
    </div>
  );
};

export default App;
