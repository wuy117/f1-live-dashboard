import { Activity, Moon, Sun, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ChartsSection } from './components/ChartsSection';
import { DashboardCard } from './components/DashboardCard';
import { DriverComparison } from './components/DriverComparison';
import { ErrorMessage } from './components/ErrorMessage';
import { FavouriteDriverCard } from './components/FavouriteDriverCard';
import { LiveSessionPanel } from './components/LiveSessionPanel';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { RaceSchedule } from './components/RaceSchedule';
import { RaceCountdownHero } from './components/RaceCountdownHero';
import { StandingsTable } from './components/StandingsTable';
import { useF1Data } from './hooks/useF1Data';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ThemePreference } from './types/f1';
import { formatDateTime } from './utils/dates';
import { classNames } from './utils/formatters';
import { teamAccentStyle } from './utils/teamColors';

const navItems = ['Overview', 'Live', 'Standings', 'Results'] as const;
type NavItem = (typeof navItems)[number];

export default function App() {
  const { data, loading, error } = useF1Data();
  const [activeSection, setActiveSection] = useState<NavItem>('Overview');
  const [favouriteDriverId, setFavouriteDriverId] = useLocalStorage('f1-live-dashboard:favourite-driver', '');
  const [theme, setTheme] = useLocalStorage<ThemePreference>('f1-live-dashboard:theme', 'dark');
  const [compareDriverA, setCompareDriverA] = useLocalStorage('f1-live-dashboard:compare-driver-a', '');
  const [compareDriverB, setCompareDriverB] = useLocalStorage('f1-live-dashboard:compare-driver-b', '');
  const [driverSearch, setDriverSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All teams');

  const favouriteOptions = data?.driverStandings.filter((item) => item.driver).map((item) => item.driver!) ?? [];

  const qualifyingSummary = useMemo(() => data?.qualifying.slice(0, 3) ?? [], [data?.qualifying]);

  return (
    <main className={classNames('min-h-screen font-display text-slate-100', theme === 'light' && 'theme-light')}>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(225,6,0,0.28),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,135,0,0.10),transparent_28%),linear-gradient(135deg,#050509_0%,#111119_48%,#050507_100%)]" />
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-glow backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-f1-red text-white">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-f1-red">Strategy wall</p>
                <h1 className="text-3xl font-black uppercase text-white sm:text-4xl">F1 Live Dashboard</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Championship context, race weekend operations, and OpenF1 timing in one dark-mode command center.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={favouriteDriverId}
              onChange={(event) => setFavouriteDriverId(event.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black/45 px-3 text-sm text-white outline-none ring-f1-red/30 transition focus:border-f1-red focus:ring-4"
            >
              <option value="">Favourite driver</option>
              {favouriteOptions.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName}
                </option>
              ))}
            </select>
            <button
              type="button"
              title="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:border-f1-red/60 hover:bg-f1-red/15"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <nav className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-2 backdrop-blur">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveSection(item)}
              className={classNames(
                'h-10 rounded-lg px-4 text-sm font-semibold text-slate-300 transition',
                activeSection === item ? 'bg-f1-red text-white shadow-glow' : 'hover:bg-white/10 hover:text-white',
              )}
            >
              {item}
            </button>
          ))}
        </nav>

        <ErrorMessage message={error} />

        {loading && !data ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <LoadingSkeleton rows={6} card className="lg:col-span-2" />
            <LoadingSkeleton rows={6} card />
          </div>
        ) : (
          <>
            <div className="mt-5">
              <RaceCountdownHero race={data?.nextRace} />
            </div>

            {activeSection === 'Overview' && (
              <div className="mt-5 space-y-5">
                <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
                  <DriverComparison
                    standings={data?.driverStandings ?? []}
                    latestRace={data?.latestRace}
                    firstDriverId={compareDriverA}
                    secondDriverId={compareDriverB}
                    onFirstDriverChange={setCompareDriverA}
                    onSecondDriverChange={setCompareDriverB}
                  />
                  <FavouriteDriverCard favouriteDriverId={favouriteDriverId} standings={data?.driverStandings ?? []} latestRace={data?.latestRace} />
                </section>

                <section className="grid gap-5 lg:grid-cols-3">
                  <DashboardCard title="Latest Winner" eyebrow="Race result" action={<Trophy className="h-5 w-5 text-yellow-300" />}>
                    {data?.latestRaceWinner ? (
                      <div>
                        <p className="text-3xl font-black text-white">{data.latestRaceWinner.driver.fullName}</p>
                        <p className="mt-2 text-sm text-slate-400">{data.latestRace?.raceName} · {data.latestRaceWinner.constructor.name}</p>
                        <p className="mt-5 font-mono text-2xl font-bold text-f1-red">+{data.latestRaceWinner.points} pts</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Latest winner data is unavailable.</p>
                    )}
                  </DashboardCard>
                  <TopFive title="Top 5 Drivers" items={(data?.driverStandings ?? []).slice(0, 5).map((item) => ({ name: item.driver?.fullName ?? 'Driver', meta: item.driver?.team ?? '', points: item.points, team: item.driver?.team }))} />
                  <TopFive title="Top 5 Constructors" items={(data?.constructorStandings ?? []).slice(0, 5).map((item) => ({ name: item.constructor?.name ?? 'Constructor', meta: item.constructor?.nationality ?? '', points: item.points, team: item.constructor?.name }))} />
                </section>

                <RaceSchedule race={data?.nextRace} />
                <ChartsSection driverStandings={data?.driverStandings ?? []} constructorStandings={data?.constructorStandings ?? []} latestRace={data?.latestRace} />
              </div>
            )}

            {activeSection === 'Live' && (
              <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <LiveSessionPanel />
                <RaceSchedule race={data?.nextRace} />
              </div>
            )}

            {activeSection === 'Standings' && (
              <div className="mt-5 space-y-5">
                <StandingsTable
                  type="drivers"
                  standings={data?.driverStandings ?? []}
                  favouriteDriverId={favouriteDriverId}
                  search={driverSearch}
                  teamFilter={teamFilter}
                  onSearchChange={setDriverSearch}
                  onTeamFilterChange={setTeamFilter}
                  onFavouriteChange={setFavouriteDriverId}
                />
                <StandingsTable type="constructors" standings={data?.constructorStandings ?? []} />
                <DriverComparison
                  standings={data?.driverStandings ?? []}
                  latestRace={data?.latestRace}
                  firstDriverId={compareDriverA}
                  secondDriverId={compareDriverB}
                  onFirstDriverChange={setCompareDriverA}
                  onSecondDriverChange={setCompareDriverB}
                />
                <ChartsSection driverStandings={data?.driverStandings ?? []} constructorStandings={data?.constructorStandings ?? []} latestRace={data?.latestRace} />
              </div>
            )}

            {activeSection === 'Results' && (
              <div className="mt-5 space-y-5">
                <LatestRaceResultsSection data={data} favouriteDriverId={favouriteDriverId} />
                <DashboardCard title="Latest Qualifying" eyebrow="Grid form">
                  {qualifyingSummary.length ? (
                    <div className="grid gap-3 md:grid-cols-3">
                      {qualifyingSummary.map((item) => (
                        <div key={item.driver.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                          <p className="font-mono text-sm text-f1-red">P{item.position}</p>
                          <p className="mt-1 font-semibold text-white">{item.driver.fullName}</p>
                          <p className="text-sm text-slate-400">{item.constructor.name}</p>
                          <p className="mt-3 font-mono text-xs text-slate-500">Q3 {item.q3 ?? item.q2 ?? item.q1 ?? '--'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Qualifying results are not available for the latest race.</p>
                  )}
                </DashboardCard>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function TopFive({ title, items }: { title: string; items: { name: string; meta: string; points: number; team?: string }[] }) {
  return (
    <DashboardCard title={title} eyebrow="Leaders">
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.name} className="team-accent-card flex items-center justify-between rounded-xl border border-white/10 bg-black/25 p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.04]" style={teamAccentStyle(item.team)}>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">
                <span className="mr-2 font-mono text-[var(--team-color)]">P{index + 1}</span>
                {item.name}
              </p>
              <p className="truncate text-xs text-slate-500">{item.meta}</p>
            </div>
            <p className="font-mono font-bold text-white">{item.points}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function LatestRaceResultsSection({ data, favouriteDriverId }: { data?: ReturnType<typeof useF1Data>['data']; favouriteDriverId: string }) {
  const latest = data?.latestRace;
  return (
    <DashboardCard title={latest?.raceName ?? 'Latest Race Results'} eyebrow="Classified order">
      {latest ? (
        <>
          <div className="mb-4 text-sm text-slate-400">
            {latest.circuitName} · {formatDateTime(latest.date)}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
              <thead className="sticky top-0 bg-[#111119]/95 backdrop-blur">
                <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="border-b border-white/10 px-3 py-3">Pos</th>
                  <th className="border-b border-white/10 px-3 py-3">Driver</th>
                  <th className="border-b border-white/10 px-3 py-3">Constructor</th>
                  <th className="border-b border-white/10 px-3 py-3">Time / Status</th>
                  <th className="border-b border-white/10 px-3 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {latest.results.map((result) => (
                  <tr
                    key={`${result.position}-${result.driver.id}`}
                    className={classNames('transition hover:bg-white/[0.04]', result.driver.id === favouriteDriverId && 'bg-f1-red/10')}
                    style={teamAccentStyle(result.constructor.name)}
                  >
                    <td className="border-b border-white/5 px-3 py-3 font-mono text-slate-300">
                      <span className="mr-2 inline-block h-6 w-1 rounded-full bg-[var(--team-color)] align-middle" />
                      P{result.position}
                    </td>
                    <td className="border-b border-white/5 px-3 py-3 font-semibold text-white">{result.driver.fullName}</td>
                    <td className="border-b border-white/5 px-3 py-3 text-slate-300">{result.constructor.name}</td>
                    <td className="border-b border-white/5 px-3 py-3 text-slate-300">{result.timeOrStatus}</td>
                    <td className="border-b border-white/5 px-3 py-3 text-right font-mono font-bold text-white">{result.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">Latest race results are unavailable right now.</p>
      )}
    </DashboardCard>
  );
}
