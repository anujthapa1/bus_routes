import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { BUS_ROUTES } from "@/lib/busRoutes";

const SERVICE_START_MINUTES = 6 * 60;
const SERVICE_END_MINUTES = 21 * 60 + 30;

function extractBaseFrequencyMinutes(frequencyLabel: string): number {
  const matchedMinutes = frequencyLabel.match(/(\d+)/);
  if (!matchedMinutes) {
    return 10;
  }

  return Math.max(5, Number(matchedMinutes[1]));
}

function toClockLabel(totalMinutes: number): string {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  const hour12 = hour24 % 12 || 12;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function randomizedIntervalMinutes(routeId: number, sequenceIndex: number, baseFrequencyMinutes: number): number {
  const minInterval = 5;
  const maxInterval = Math.max(minInterval, baseFrequencyMinutes + 2);
  const span = maxInterval - minInterval + 1;
  const seed = routeId * 131 + sequenceIndex * 53 + 17;
  return minInterval + (seed % span);
}

function buildDepartureTimes(routeId: number, frequencyLabel: string): string[] {
  const baseFrequencyMinutes = extractBaseFrequencyMinutes(frequencyLabel);
  const departureTimes: string[] = [];

  let currentMinute = SERVICE_START_MINUTES + (routeId % 4) * 5;
  let sequenceIndex = 0;

  while (currentMinute <= SERVICE_END_MINUTES) {
    departureTimes.push(toClockLabel(currentMinute));
    currentMinute += randomizedIntervalMinutes(routeId, sequenceIndex, baseFrequencyMinutes);
    sequenceIndex += 1;
  }

  return departureTimes;
}

export default function SchedulesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex flex-1 lg:ml-64">
        <Sidebar />

        <div className="flex flex-1 flex-col items-center px-4 py-6 md:px-10 lg:px-20">
          <div className="w-full max-w-5xl space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bus Schedules</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Bus-only departure times in dropdown view. Intervals are shown in random 5+ minute gaps.
              </p>
            </div>

            <div className="space-y-3">
              {BUS_ROUTES.map((route) => {
                const departureTimes = buildDepartureTimes(route.id, route.frequency);

                return (
                  <details
                    key={route.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors open:border-primary/40 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100">{route.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Frequency: {route.frequency} | Fare: {route.fareLabel}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                          Show Times
                        </span>
                      </div>
                    </summary>

                    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Departure Times
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {departureTimes.map((departureTime) => (
                          <span
                            key={`${route.id}-${departureTime}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {departureTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
