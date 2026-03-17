"use client";

import { useState } from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import GoogleMap from "@/components/GoogleMap";

const GOOGLE_MAPS_API_KEY = "AIzaSyCZV9usZJxPfhkm1xsLURfkY8fndcBH-Bo";

export default function FarePage() {
  const [fareType, setFareType] = useState('standard');
  const baseFare = 25.00;

  const getDiscountedFare = () => {
    if (fareType === 'student') return baseFare * 0.55;
    if (fareType === 'senior') return baseFare * 0.50;
    return baseFare;
  };

  const discountAmount = baseFare - getDiscountedFare();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex flex-1 lg:ml-64">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row min-h-full">
            {/* Map Section */}
            <div className="relative flex-1 min-h-[300px] lg:h-auto border-r border-slate-200 dark:border-slate-800">
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 overflow-hidden">
                <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} center={{ lat: 28.2096, lng: 83.9856 }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-full h-full">
                    <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                      <path className="drop-shadow-lg" d="M150 450 L300 380 L450 400 L550 250 L700 180" stroke="#13b6ec" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
                      <circle cx="150" cy="450" fill="white" r="8" stroke="#13b6ec" strokeWidth="3"></circle>
                      <circle cx="700" cy="180" fill="white" r="8" stroke="#13b6ec" strokeWidth="3"></circle>
                      <circle cx="450" cy="400" fill="#13b6ec" r="5"></circle>
                    </svg>
                    <div className="absolute top-[430px] left-[130px] bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md text-[10px] font-bold">LAKESIDE</div>
                    <div className="absolute top-[160px] left-[680px] bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-md text-[10px] font-bold">BAGAR</div>
                  </div>
                </div>
              </div>

              {/* Route Summary Floating Overlay (Mobile style) */}
              <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border border-primary/20 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <span className="material-symbols-outlined text-primary">directions_bus</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Next Bus</p>
                    <p className="font-bold">Line 14 • 4 mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Distance</p>
                  <p className="font-bold">4.2 km</p>
                </div>
              </div>
            </div>

            {/* Fare and Details Panel */}
            <div className="w-full lg:w-[450px] bg-white dark:bg-background-dark border-t lg:border-t-0 border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Fare Calculator</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">LIVE RATES</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm">circle</span>
                      <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700"></div>
                      <span className="material-symbols-outlined text-red-500 text-sm">location_on</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">From</p>
                        <p className="font-semibold">Prithvi Chowk Terminal</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">To</p>
                        <p className="font-semibold">Lakeside North Gate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Selection */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Passenger Type</p>
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${fareType === 'standard' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                    onClick={() => setFareType('standard')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">person</span>
                      <span className="font-semibold">Standard Adult</span>
                    </div>
                    <input type="radio" checked={fareType === 'standard'} readOnly className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${fareType === 'student' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                    onClick={() => setFareType('student')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">school</span>
                      <span className="font-semibold">Student (45% Off)</span>
                    </div>
                    <input type="radio" checked={fareType === 'student'} readOnly className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${fareType === 'senior' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                    onClick={() => setFareType('senior')}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">accessible</span>
                      <span className="font-semibold">Senior / Disabled</span>
                    </div>
                    <input type="radio" checked={fareType === 'senior'} readOnly className="w-5 h-5 text-primary border-slate-300 focus:ring-primary" />
                  </label>
                </div>

                {/* Fare Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 space-y-3 mb-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Standard Fare</span>
                    <span className="font-medium">NPR {baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Discount Applied</span>
                    <span className="text-emerald-500 font-medium">-NPR {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-base font-bold">Total Payable</span>
                    <span className="text-xl font-bold text-primary">NPR {getDiscountedFare().toFixed(2)}</span>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-base">schedule</span>
                    <span className="text-sm font-bold">Today&apos;s Schedule</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    <div className="shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-primary/20">
                      <p className="text-xs text-slate-500">Departing</p>
                      <p className="font-bold">09:15 AM</p>
                    </div>
                    <div className="shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500">Departing</p>
                      <p className="font-bold">09:30 AM</p>
                    </div>
                    <div className="shrink-0 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500">Departing</p>
                      <p className="font-bold">09:45 AM</p>
                    </div>
                  </div>
                </div>

                {/* Official Rules Accordion */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    Official Discount Rules
                  </h3>
                  <div className="space-y-2">
                    <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-500">school</span>
                          <span className="font-semibold text-sm">Student Discount (45%)</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                      </summary>
                      <div className="px-4 pb-4">
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tight">Proof Required</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Valid institutional Student ID card with current academic year sticker.</p>
                        </div>
                      </div>
                    </details>

                    <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-500">elderly</span>
                          <span className="font-semibold text-sm">Senior Discount (50%)</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                      </summary>
                      <div className="px-4 pb-4">
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tight">Proof Required</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Official Government Senior ID or Citizenship card (Aged 60+).</p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pb-24 lg:pb-6">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">qr_code_scanner</span>
                    Pay with Mobile Wallet
                  </button>
                  <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold py-3 rounded-xl transition-colors">
                    View Full Stop Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
