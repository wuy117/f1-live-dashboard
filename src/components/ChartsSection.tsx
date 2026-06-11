import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LatestRaceResults, Standing } from '../types/f1';
import { DashboardCard } from './DashboardCard';

interface ChartsSectionProps {
  driverStandings: Standing[];
  constructorStandings: Standing[];
  latestRace?: LatestRaceResults;
}

export function ChartsSection({ driverStandings, constructorStandings, latestRace }: ChartsSectionProps) {
  const driverData = driverStandings.slice(0, 10).map((item) => ({ name: item.driver?.code ?? item.driver?.familyName ?? 'DRV', points: item.points }));
  const constructorData = constructorStandings.map((item) => ({ name: item.constructor?.name ?? 'Team', points: item.points }));
  const raceData = latestRace?.results.slice(0, 10).map((item) => ({ name: item.driver.code ?? item.driver.familyName, points: item.points })) ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Driver Points" data={driverData} color="#e10600" />
      <ChartCard title="Constructor Points" data={constructorData} color="#38bdf8" />
      <ChartCard title="Latest Race Points" data={raceData} color="#22c55e" />
    </div>
  );
}

function ChartCard({ title, data, color }: { title: string; data: { name: string; points: number }[]; color: string }) {
  return (
    <DashboardCard title={title} eyebrow="Charts">
      <div className="h-72">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 24 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.06)' }}
                contentStyle={{ background: '#111119', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff' }}
              />
              <Bar dataKey="points" fill={color} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Chart data unavailable</div>
        )}
      </div>
    </DashboardCard>
  );
}
