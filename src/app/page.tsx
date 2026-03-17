import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import GoogleMap from "@/components/GoogleMap";

const GOOGLE_MAPS_API_KEY = "AIzaSyCZV9usZJxPfhkm1xsLURfkY8fndcBH-Bo";

export default function Home() {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <Header />
      <main className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="relative flex-1 flex flex-col lg:ml-64">
          {/* Map Area */}
          <div className="relative flex-1 bg-slate-200 dark:bg-slate-900 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0">
              <GoogleMap apiKey={GOOGLE_MAPS_API_KEY} />
            </div>

            {/* Floating Map Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
              <div className="flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">add</span>
                </button>
                <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">remove</span>
                </button>
              </div>
              <button className="flex size-12 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-primary">my_location</span>
              </button>
            </div>

            {/* Search Floating bar */}
            <div className="absolute top-6 left-6 z-10 w-96 hidden md:flex items-center bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2">
              <span className="material-symbols-outlined text-slate-400 ml-2">search</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 px-3 outline-none"
                placeholder="Search for stops or landmarks"
                type="text"
              />
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>

            {/* Route Planning Card (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-center mb-4 md:hidden">
                  <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">Plan Your Journey</h2>
                <div className="flex flex-col gap-4">
                  <div className="relative flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-primary scale-75">radio_button_checked</span>
                      <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">From</p>
                      <input className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-slate-100 focus:ring-0 placeholder:text-slate-400 font-medium outline-none" placeholder="Current location" type="text"/>
                    </div>
                  </div>
                  <div className="relative flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-red-500 scale-75">location_on</span>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">To</p>
                      <input className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-slate-100 focus:ring-0 placeholder:text-slate-400 font-medium outline-none" placeholder="Search destination..." type="text"/>
                    </div>
                    <button className="flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">swap_vert</span>
                    </button>
                  </div>
                  <button className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">directions_bus</span>
                    Find Best Route
                  </button>
                </div>

                {/* Quick Landmarks */}
                <div className="flex gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">home</span>
                    <span className="text-sm font-medium">Home</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">work</span>
                    <span className="text-sm font-medium">Work</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm">landscape</span>
                    <span className="text-sm font-medium">Lakeside</span>
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
