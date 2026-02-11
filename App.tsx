
import React, { useState, useEffect, useRef } from 'react';
import Calculator from './components/Calculator';
import Notepad from './components/Notepad';
import { Note, Calculation } from './types';
import { CloudDownload, CloudUpload, Zap, Calculator as CalcIcon, StickyNote, History } from 'lucide-react';

const App: React.FC = () => {
  const [history, setHistory] = useState<Calculation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calc' | 'notes'>('calc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('kala_notes');
    const savedHistory = localStorage.getItem('kala_history');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

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
    alert('✅ Backup Saved Successfully!');
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
        alert('🔄 Data Restored Successfully!');
      } catch (err) {
        alert('❌ Invalid Backup File.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] safe-top safe-bottom">
      {/* Header */}
      <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Zap size={18} fill="currentColor" className="text-white" />
          </div>
          <div className="leading-none">
            <h1 className="text-sm font-black tracking-tight uppercase italic text-white">Kala Calc</h1>
            <p className="text-[8px] font-bold text-indigo-400 tracking-[0.1em] uppercase">Persistent Workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImportBackup} className="hidden" accept=".json" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 bg-white/5 rounded-lg border border-white/5 active:scale-90 transition-transform"
          >
            <CloudUpload size={16} />
          </button>
          <button 
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider text-white active:scale-95 transition-transform"
          >
            <CloudDownload size={14} />
            <span>Backup</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative p-3 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Desktop View: Both Side-by-Side */}
        <div className={`
          flex-1 flex flex-col gap-4 overflow-y-auto
          ${activeTab === 'calc' ? 'flex animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden md:flex md:w-[400px] md:shrink-0'}
        `}>
          <Calculator history={history.map(h => ({ expression: h.expression, result: h.result }))} onCalculate={handleCalculate} />
        </div>

        <div className={`
          flex-1 h-full flex flex-col gap-4 overflow-hidden
          ${activeTab === 'notes' ? 'flex animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden md:flex'}
        `}>
          <Notepad 
            notes={notes} 
            onSave={handleSaveNote} 
            onDelete={handleDeleteNote} 
            activeNoteId={activeNoteId}
            setActiveNoteId={setActiveNoteId}
          />
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden flex bg-[#0f172a]/90 border-t border-white/5 backdrop-blur-2xl shrink-0">
        <button 
          onClick={() => setActiveTab('calc')}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${activeTab === 'calc' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}
        >
          <CalcIcon size={22} className={activeTab === 'calc' ? 'scale-110' : ''} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Logic</span>
          {activeTab === 'calc' && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />}
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${activeTab === 'notes' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}
        >
          <StickyNote size={22} className={activeTab === 'notes' ? 'scale-110' : ''} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Notes</span>
          {activeTab === 'notes' && <div className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />}
        </button>
      </nav>

      {/* Status Bar (Desktop) */}
      <footer className="hidden md:flex px-6 py-2 bg-black/40 border-t border-white/5 items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Local Core: Secured</span>
          <span>Buffer: {notes.length} Files</span>
        </div>
        <div className="text-slate-700">KALA.ENGINE.V2.5</div>
      </footer>
    </div>
  );
};

export default App;
