import Link from 'next/link';

export default function Header() {
  return (
    <header className="z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined">directions_bus</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Pokhara Bus Route</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Public Transport Navigator</p>
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="User profile avatar icon"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfdb7z9KKgVG6QAGLQMjd6ihEjm3oEz3vBVE2Eh1qN1t300N-kRZHhtu3m4MK5AzIVuz2SRHAnpNLiAwnUQbLyfIA3zzvwLqGrHoMjy5WdE5eo4HA5yhMXtN-ICViq5Zk6j737AvPeN02FKh1Yo7PxxjTohqyNe6y9jO2xHGnlmGfcGhz6t9ct5EVoXXJMqzCa0NiIfCn9mgczlJyTQfGjrgcVamSPK4Kc--i80zE1zxPhI6YWl746EQY_N2o6XxQvKH4FNLw6yQ8Y"
          />
        </div>
      </div>
    </header>
  );
}
