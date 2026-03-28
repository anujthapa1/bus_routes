import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-20 bottom-0 w-64 flex-col p-6 gap-6 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800">
      <nav className="flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-semibold">Dashboard</span>
        </Link>
        <Link href="/routes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">route</span>
          <span className="font-semibold">All Routes</span>
        </Link>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">map</span>
          <span className="font-semibold">Live Track</span>
        </Link>
        <Link href="/fare" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">payments</span>
          <span className="font-semibold">Fares</span>
        </Link>
        <Link href="/schedules" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined">history</span>
          <span className="font-semibold">Schedules</span>
        </Link>
      </nav>
      <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/20">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Pro Tip</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Save your frequent routes to access them faster from the home screen.</p>
      </div>
    </aside>
  );
}
