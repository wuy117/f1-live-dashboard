import type {
  ApiResult,
  Constructor,
  Driver,
  F1DashboardData,
  LatestRaceResults,
  QualifyingResult,
  Race,
  RaceResult,
  Session,
  Standing,
} from '../types/f1';
import { getSessionStatus } from '../utils/dates';
import { fetchJson } from './storage';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const CURRENT_SEASON = 'current';

interface JolpicaResponse {
  MRData?: {
    RaceTable?: { Races?: unknown[] };
    StandingsTable?: { StandingsLists?: unknown[] };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isJolpicaResponse(value: unknown): value is JolpicaResponse {
  return isRecord(value) && isRecord(value.MRData);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseDriver(value: unknown, constructorName?: string): Driver {
  const driver = isRecord(value) ? value : {};
  const givenName = asString(driver.givenName);
  const familyName = asString(driver.familyName);
  return {
    id: asString(driver.driverId, `${givenName}-${familyName}`),
    code: asString(driver.code, undefined as unknown as string),
    permanentNumber: asString(driver.permanentNumber, undefined as unknown as string),
    givenName,
    familyName,
    fullName: `${givenName} ${familyName}`.trim(),
    nationality: asString(driver.nationality, 'Unknown'),
    team: constructorName,
  };
}

function parseConstructor(value: unknown): Constructor {
  const constructor = isRecord(value) ? value : {};
  return {
    id: asString(constructor.constructorId, asString(constructor.name)),
    name: asString(constructor.name, 'Unknown constructor'),
    nationality: asString(constructor.nationality, 'Unknown'),
  };
}

function sessionFromRace(raw: Record<string, unknown>, apiName: string, label: string): Session | undefined {
  const session = raw[apiName];
  if (!isRecord(session)) return undefined;
  const date = asString(session.date);
  if (!date) return undefined;
  const time = asString(session.time, undefined as unknown as string);
  return { name: label, date, time, status: getSessionStatus(date, time) };
}

function parseRace(value: unknown): Race {
  const race = isRecord(value) ? value : {};
  const circuit = isRecord(race.Circuit) ? race.Circuit : {};
  const location = isRecord(circuit.Location) ? circuit.Location : {};
  const date = asString(race.date);
  const time = asString(race.time, undefined as unknown as string);
  const optionalSessions = [
    sessionFromRace(race, 'FirstPractice', 'FP1'),
    sessionFromRace(race, 'SecondPractice', 'FP2'),
    sessionFromRace(race, 'ThirdPractice', 'FP3'),
    sessionFromRace(race, 'SprintShootout', 'Sprint Shootout'),
    sessionFromRace(race, 'SprintQualifying', 'Sprint Qualifying'),
    sessionFromRace(race, 'Sprint', 'Sprint'),
    sessionFromRace(race, 'Qualifying', 'Qualifying'),
  ].filter((session): session is Session => Boolean(session));
  return {
    round: asString(race.round),
    raceName: asString(race.raceName, 'Grand Prix'),
    circuitName: asString(circuit.circuitName, 'Circuit TBC'),
    country: asString(location.country, 'TBC'),
    locality: asString(location.locality, undefined as unknown as string),
    date,
    time,
    sessions: [...optionalSessions, { name: 'Race', date, time, status: getSessionStatus(date, time, 3) }],
  };
}

function parseDriverStandings(value: unknown): Standing[] {
  const root = isRecord(value) ? value : {};
  const lists = isRecord(root.MRData) && isRecord(root.MRData.StandingsTable) ? root.MRData.StandingsTable.StandingsLists : undefined;
  const first = Array.isArray(lists) && isRecord(lists[0]) ? lists[0] : {};
  const rows = Array.isArray(first.DriverStandings) ? first.DriverStandings : [];
  return rows.map((row) => {
    const item = isRecord(row) ? row : {};
    const constructors = Array.isArray(item.Constructors) ? item.Constructors : [];
    const constructor = parseConstructor(constructors[0]);
    return {
      position: asNumber(item.position),
      driver: parseDriver(item.Driver, constructor.name),
      constructor,
      points: asNumber(item.points),
      wins: asNumber(item.wins),
    };
  });
}

function parseConstructorStandings(value: unknown): Standing[] {
  const root = isRecord(value) ? value : {};
  const lists = isRecord(root.MRData) && isRecord(root.MRData.StandingsTable) ? root.MRData.StandingsTable.StandingsLists : undefined;
  const first = Array.isArray(lists) && isRecord(lists[0]) ? lists[0] : {};
  const rows = Array.isArray(first.ConstructorStandings) ? first.ConstructorStandings : [];
  return rows.map((row) => {
    const item = isRecord(row) ? row : {};
    return {
      position: asNumber(item.position),
      constructor: parseConstructor(item.Constructor),
      points: asNumber(item.points),
      wins: asNumber(item.wins),
    };
  });
}

function parseLatestRaceResults(value: unknown): LatestRaceResults | undefined {
  const root = isRecord(value) ? value : {};
  const races = isRecord(root.MRData) && isRecord(root.MRData.RaceTable) && Array.isArray(root.MRData.RaceTable.Races)
    ? root.MRData.RaceTable.Races
    : [];
  const race = isRecord(races[0]) ? races[0] : undefined;
  if (!race) return undefined;
  const circuit = isRecord(race.Circuit) ? race.Circuit : {};
  const rows = Array.isArray(race.Results) ? race.Results : [];
  const results: RaceResult[] = rows.map((row) => {
    const item = isRecord(row) ? row : {};
    const constructor = parseConstructor(item.Constructor);
    const time = isRecord(item.Time) ? asString(item.Time.time) : asString(item.status);
    return {
      position: asNumber(item.position),
      driver: parseDriver(item.Driver, constructor.name),
      constructor,
      timeOrStatus: time || 'Classified',
      points: asNumber(item.points),
      grid: asNumber(item.grid),
      laps: asNumber(item.laps),
    };
  });
  return {
    raceName: asString(race.raceName, 'Latest race'),
    date: asString(race.date),
    circuitName: asString(circuit.circuitName, 'Circuit'),
    results,
  };
}

function parseQualifying(value: unknown): QualifyingResult[] {
  const root = isRecord(value) ? value : {};
  const races = isRecord(root.MRData) && isRecord(root.MRData.RaceTable) && Array.isArray(root.MRData.RaceTable.Races)
    ? root.MRData.RaceTable.Races
    : [];
  const race = isRecord(races[0]) ? races[0] : {};
  const rows = Array.isArray(race.QualifyingResults) ? race.QualifyingResults : [];
  return rows.map((row) => {
    const item = isRecord(row) ? row : {};
    const constructor = parseConstructor(item.Constructor);
    return {
      position: asNumber(item.position),
      driver: parseDriver(item.Driver, constructor.name),
      constructor,
      q1: asString(item.Q1, undefined as unknown as string),
      q2: asString(item.Q2, undefined as unknown as string),
      q3: asString(item.Q3, undefined as unknown as string),
    };
  });
}

async function getJolpica(url: string, key: string): Promise<ApiResult<JolpicaResponse>> {
  return fetchJson<JolpicaResponse>(url, key, isJolpicaResponse);
}

export async function getSeasonCalendar(): Promise<ApiResult<Race[]>> {
  const response = await getJolpica(`${BASE_URL}/${CURRENT_SEASON}.json`, 'jolpica-calendar');
  return {
    ...response,
    data: response.data?.MRData?.RaceTable?.Races?.map(parseRace) ?? [],
  };
}

export async function getDriverStandings(): Promise<ApiResult<Standing[]>> {
  const response = await getJolpica(`${BASE_URL}/${CURRENT_SEASON}/driverstandings.json`, 'jolpica-driver-standings');
  return { ...response, data: response.data ? parseDriverStandings(response.data) : [] };
}

export async function getConstructorStandings(): Promise<ApiResult<Standing[]>> {
  const response = await getJolpica(`${BASE_URL}/${CURRENT_SEASON}/constructorstandings.json`, 'jolpica-constructor-standings');
  return { ...response, data: response.data ? parseConstructorStandings(response.data) : [] };
}

export async function getLatestRaceResults(): Promise<ApiResult<LatestRaceResults | undefined>> {
  const response = await getJolpica(`${BASE_URL}/current/last/results.json`, 'jolpica-latest-results');
  return { ...response, data: response.data ? parseLatestRaceResults(response.data) : undefined };
}

export async function getLatestQualifyingResults(): Promise<ApiResult<QualifyingResult[]>> {
  const response = await getJolpica(`${BASE_URL}/current/last/qualifying.json`, 'jolpica-latest-qualifying');
  return { ...response, data: response.data ? parseQualifying(response.data) : [] };
}

export async function getDashboardData(): Promise<ApiResult<F1DashboardData>> {
  const [calendar, driverStandings, constructorStandings, latestRace, qualifying] = await Promise.all([
    getSeasonCalendar(),
    getDriverStandings(),
    getConstructorStandings(),
    getLatestRaceResults(),
    getLatestQualifyingResults(),
  ]);
  const races = calendar.data ?? [];
  const now = Date.now();
  const nextRace = races.find((race) => new Date(`${race.date}T${race.time ?? '00:00:00Z'}`).getTime() >= now) ?? races.at(-1);
  const data: F1DashboardData = {
    calendar: races,
    nextRace,
    latestRace: latestRace.data,
    driverStandings: driverStandings.data ?? [],
    constructorStandings: constructorStandings.data ?? [],
    qualifying: qualifying.data ?? [],
    latestRaceWinner: latestRace.data?.results[0],
  };
  const error = [calendar, driverStandings, constructorStandings, latestRace, qualifying].find((item) => item.error)?.error;
  return { data, error };
}
