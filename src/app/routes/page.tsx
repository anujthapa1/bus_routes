import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from 'next/link';

const routes = [
  {
    id: 1,
    name: "Route 1: Lakeside → Mahendrapul",
    stops: "Hallan Chowk, Sahid Chowk, Prithvi Chowk, Hospital Chowk",
    frequency: "Every 10 mins",
    fare: "NPR 25 - 40",
    status: "Active",
    color: "green"
  },
  {
    id: 4,
    name: "Route 4: Bagar → Chhorepatan",
    stops: "PN Campus, Bindhyabasini, Chipledhunga, Birauta",
    frequency: "Every 15 mins",
    fare: "NPR 30 - 50",
    status: "Active",
    color: "green"
  },
  {
    id: 7,
    name: "Route 7: Lamachaur → Sedi",
    stops: "WRC Campus, Hari Chowk, Zero KM, Lakeside North",
    frequency: "Every 30 mins",
    fare: "NPR 35 - 60",
    status: "Limited",
    color: "amber"
  },
  {
    id: 11,
    name: "Route 11: Malepatan → Lekhnath",
    stops: "Parsyang, Srijana Chowk, Amarsingh, Bijayapur, Talchowk",
    frequency: "Every 20 mins",
    fare: "NPR 40 - 80",
    status: "Active",
    color: "green"
  }
];

export default function RoutesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex flex-1 lg:ml-64">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center py-6 px-4 md:px-10 lg:px-20">
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Search Section */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm">
                  <div className="text-slate-400 flex bg-white dark:bg-slate-900 items-center justify-center pl-4 rounded-l-xl">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="flex-1 rounded-r-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-slate-900 h-full placeholder:text-slate-400 px-4 pl-2 text-base font-normal outline-none"
                    placeholder="Search by route name, stop, or destination..."
                  />
                </div>
              </div>

              {/* Tab Filters */}
              <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-primary text-white">
                  All Routes
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  City Bus
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Micro Bus
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Tourist Bus
                </button>
              </div>
            </div>

            {/* Routes List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest px-2">
                Available Routes ({routes.length})
              </h3>

              {routes.map((route) => (
                <div key={route.id} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm group cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-14 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">route</span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">{route.name}</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          route.color === 'green'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {route.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal truncate">{route.stops}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {route.frequency}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-xs">payments</span>
                          {route.fare}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
                    <Link href="/fare" className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all">
                      Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Shortcut Section */}
            <div className="relative w-full h-48 rounded-2xl overflow-hidden mt-4 group">
              <div className="absolute inset-0 bg-slate-900/40 z-10 flex flex-col items-center justify-center text-center p-6 transition-all group-hover:bg-slate-900/20">
                <h4 className="text-white text-2xl font-bold mb-2">View Live Map</h4>
                <p className="text-white/90 text-sm mb-4">See all active buses across Pokhara in real-time</p>
                <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                  <span className="material-symbols-outlined">map</span>
                  Open Map View
                </Link>
              </div>
              <div
                className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtbtX4tWdyFPA3oHHj3cmzHc_6SyMHd8NrYbWUN9yKe0LklWuU3mF6XbpdsA3JMawyl6JZXSaDlGOr1LwSYeM1YPhO2TmhZ58gKrt7JXxK_bYGQnUKNb8jngHsKRvrGJhUHysVNT-xP-McPml6fCRhDknLEiQ4MO-Ctp0ZnOVgeRbox_dYYQuJe-xOwnSgcpWjybMaEM41oN1HcH75jhS1N44A8XPqoVKpwrQUICT5rlk1wY0wGFQL3lEfvz5XTHsRu_nqCVZ5COgY')" }}
              ></div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
