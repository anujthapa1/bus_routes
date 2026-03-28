"use client";

import React from "react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={onZoomIn}
        className="border-b border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
        aria-label="Zoom in"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">add</span>
      </button>
      <button
        onClick={onZoomOut}
        className="p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
        aria-label="Zoom out"
      >
        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">remove</span>
      </button>
    </div>
  );
}
