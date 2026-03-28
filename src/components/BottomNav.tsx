import Link from 'next/link';

export default function BottomNav() {
  return (
    <footer className="md:hidden sticky bottom-0 z-50 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-6 py-3">
      <nav className="flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/routes" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold">Routes</span>
        </Link>
        <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-bold">Map</span>
        </Link>
        <Link href="/schedules" className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-bold">Schedules</span>
        </Link>
      </nav>
    </footer>
  );
}
