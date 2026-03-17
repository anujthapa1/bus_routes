"use client";

import React from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function ZoomControls() {
  const map = useMap();

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 13) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 13) - 1);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <button
        onClick={handleZoomIn}
        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 transition-colors"
        aria-label="Zoom in"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">add</span>
      </button>
      <button
        onClick={handleZoomOut}
        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Zoom out"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">remove</span>
      </button>
    </div>
  );
}
