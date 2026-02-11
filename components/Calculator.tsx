
import React, { useState } from 'react';
import { History, Delete } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (expression: string, result: string) => void;
  history: { expression: string; result: string }[];
}

const Calculator: React.FC<CalculatorProps> = ({ onCalculate, history }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      const result = Function('"use strict";return (' + fullExpression.replace(/[^-()\d/*+.]/g, '') + ')')();
      const resultStr = result.toString();
      onCalculate(fullExpression, resultStr);
      setDisplay(resultStr);
      setExpression('');
    } catch (e) {
      setDisplay('Error');
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
    <div className="bg-slate-900/50 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 w-full max-w-sm mx-auto backdrop-blur-sm">
      <div className="p-8 bg-black/40 text-white flex flex-col items-end min-h-[160px] justify-end border-b border-slate-800">
        <div className="text-slate-500 text-sm font-mono-custom h-6 overflow-hidden text-right w-full mb-1">
          {expression}
        </div>
        <div className="text-5xl font-bold font-mono-custom tracking-tighter truncate w-full text-right">
          {display}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 p-5 bg-slate-900/30">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`
              h-16 rounded-2xl font-semibold text-xl transition-all active:scale-95 flex items-center justify-center
              ${btn.colSpan === 2 ? 'col-span-2' : ''}
              ${btn.type === 'operator' ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : ''}
              ${btn.type === 'special' ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30' : ''}
              ${btn.type === 'equals' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/40' : ''}
              ${!btn.type ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' : ''}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5 bg-slate-900/30">
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <History size={14} /> History
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-slate-600 text-xs italic">Clear workspace...</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-xs group py-1 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-500 truncate mr-2">{h.expression} =</span>
                  <span className="font-bold text-indigo-400 shrink-0">{h.result}</span>
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
