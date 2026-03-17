"use client";

import React from 'react';

interface RouteResult {
  id: number;
  name: string;
  frequency: string;
  calculatedFare?: number;
}

interface RouteResultsProps {
  results: RouteResult[];
}

export default function RouteResults({ results }: RouteResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recommended Routes</p>
      {results.map((result, index) => (
        <div
          key={result.id}
          className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border transition-all ${
            index === 0 ? 'border-primary shadow-sm' : 'border-slate-100 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${index === 0 ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
              <span className="material-symbols-outlined text-sm">route</span>
            </div>
            <div>
              <p className="text-sm font-bold">{result.name}</p>
              <p className="text-[10px] text-slate-500">{result.frequency}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">NPR {result.calculatedFare?.toFixed(2)}</p>
            {index === 0 && (
              <span className="inline-block px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[8px] font-bold rounded uppercase tracking-tighter">
                Fewest transfers
              </span>
            )}
            {index !== 0 && <p className="text-[10px] text-slate-500">Alternative</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
