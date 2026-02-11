
import React, { useState } from 'react';
import { History } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (expression: string, result: string) => void;
  history: { expression: string; result: string }[];
}

const Calculator: React.FC<CalculatorProps> = ({ onCalculate, history }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const vibrate = (pattern: number | number[]) => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
    vibrate(10);
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
    vibrate(15);
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    vibrate(30);
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      const result = Function('"use strict";return (' + fullExpression.replace(/[^-()\d/*+.]/g, '') + ')')();
      const resultStr = result.toString();
      onCalculate(fullExpression, resultStr);
      setDisplay(resultStr);
      setExpression('');
      vibrate([20, 10, 20]);
    } catch (e) {
      setDisplay('Error');
      vibrate([50, 50, 50]);
    }
  };

  const buttons = [
    { label: 'C', action: clear, type: 'special' },
    { label: '÷', action: () => handleOperator('/'), type: 'operator' },
    { label: '×', action: () => handleOperator('*'), type: 'operator' },
    { label: 'DEL', action: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), type: 'special' },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '-', action: () => handleOperator('-'), type: 'operator' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '+', action: () => handleOperator('+'), type: 'operator' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '=', action: calculate, type: 'equals' },
    { label: '0', action: () => handleNumber('0'), colSpan: 2 },
    { label: '.', action: () => handleNumber('.') },
  ];

  return (
    <div className="bg-[#0f172a]/40 rounded-3xl shadow-2xl overflow-hidden border border-white/5 w-full max-w-sm mx-auto backdrop-blur-xl flex flex-col flex-1">
      {/* Display */}
      <div className="p-6 md:p-8 bg-black/40 text-white flex flex-col items-end min-h-[120px] md:min-h-[160px] justify-end border-b border-white/5 shrink-0">
        <div className="text-indigo-400 text-xs md:text-sm font-mono-custom opacity-70 h-5 md:h-6 overflow-hidden text-right w-full mb-1 tracking-widest">
          {expression || '\u00A0'}
        </div>
        <div className="text-5xl md:text-6xl font-bold font-mono-custom tracking-tighter truncate w-full text-right">
          {display}
        </div>
      </div>
      
      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2.5 md:gap-3 p-4 md:p-5 flex-1 content-center">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`
              h-[68px] md:h-[72px] rounded-2xl font-bold text-xl md:text-2xl transition-all active:scale-90 flex items-center justify-center
              ${btn.colSpan === 2 ? 'col-span-2' : ''}
              ${btn.type === 'operator' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
              ${btn.type === 'special' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ''}
              ${btn.type === 'equals' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : ''}
              ${!btn.type ? 'bg-white/5 text-slate-200 border border-white/5 hover:bg-white/10' : ''}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* History Mini-Panel */}
      <div className="px-5 pb-5 shrink-0">
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 mb-2 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em]">
            <History size={10} /> Calculation Log
          </div>
          <div className="space-y-1.5 max-h-[80px] md:max-h-[100px] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-slate-700 text-[9px] italic uppercase">Workspace Clear...</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-500 font-mono-custom truncate mr-4">{h.expression}</span>
                  <span className="font-black text-indigo-400 shrink-0">{h.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
