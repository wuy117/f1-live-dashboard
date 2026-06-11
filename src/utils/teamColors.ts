import type { CSSProperties } from 'react';

const TEAM_COLOURS: Record<string, string> = {
  ferrari: '#dc0000',
  mclaren: '#ff8700',
  mercedes: '#00d2be',
  'red bull': '#3671c6',
  'red bull racing': '#3671c6',
  'aston martin': '#229971',
  alpine: '#0090ff',
  williams: '#64c4ff',
  haas: '#b6babd',
  'racing bulls': '#6692ff',
  rb: '#6692ff',
  sauber: '#52e252',
  'kick sauber': '#52e252',
  'stake f1 team kick sauber': '#52e252',
};

export function getTeamColor(teamName?: string): string {
  if (!teamName) return '#e10600';
  const normalized = teamName.toLowerCase();
  const direct = TEAM_COLOURS[normalized];
  if (direct) return direct;
  const match = Object.entries(TEAM_COLOURS).find(([team]) => normalized.includes(team));
  return match?.[1] ?? '#e10600';
}

export function teamAccentStyle(teamName?: string): CSSProperties {
  const color = getTeamColor(teamName);
  return {
    '--team-color': color,
    '--team-soft': `${color}22`,
    '--team-line': `${color}66`,
  } as CSSProperties;
}
