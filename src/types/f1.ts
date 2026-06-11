export type ThemePreference = 'dark' | 'light';

export interface Driver {
  id: string;
  code?: string;
  permanentNumber?: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  team?: string;
}

export interface Constructor {
  id: string;
  name: string;
  nationality: string;
}

export interface Race {
  round: string;
  raceName: string;
  circuitName: string;
  country: string;
  locality?: string;
  date: string;
  time?: string;
  sessions: Session[];
}

export interface Session {
  name: string;
  date: string;
  time?: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface Standing {
  position: number;
  driver?: Driver;
  constructor?: Constructor;
  points: number;
  wins?: number;
}

export interface RaceResult {
  position: number;
  driver: Driver;
  constructor: Constructor;
  timeOrStatus: string;
  points: number;
  grid?: number;
  laps?: number;
}

export interface LatestRaceResults {
  raceName: string;
  date: string;
  circuitName: string;
  results: RaceResult[];
}

export interface QualifyingResult {
  position: number;
  driver: Driver;
  constructor: Constructor;
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  year: number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour?: string;
  country_code?: string;
  headshot_url?: string;
}

export interface OpenF1Position {
  date: string;
  driver_number: number;
  position: number;
}

export interface OpenF1Lap {
  date_start?: string;
  driver_number: number;
  lap_number: number;
  lap_duration?: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
}

export interface OpenF1Interval {
  date: string;
  driver_number: number;
  gap_to_leader?: number | string | null;
  interval?: number | string | null;
}

export interface OpenF1Weather {
  date: string;
  air_temperature?: number;
  track_temperature?: number;
  humidity?: number;
  pressure?: number;
  rainfall?: number;
  wind_direction?: number;
  wind_speed?: number;
}

export interface RaceControlMessage {
  date: string;
  category?: string;
  flag?: string;
  scope?: string;
  message: string;
}

export interface LiveSessionData {
  session?: OpenF1Session;
  drivers: OpenF1Driver[];
  positions: OpenF1Position[];
  laps: OpenF1Lap[];
  intervals: OpenF1Interval[];
  weather?: OpenF1Weather;
  messages: RaceControlMessage[];
  isLiveFallback: boolean;
  lastUpdated?: string;
}

export interface F1DashboardData {
  calendar: Race[];
  nextRace?: Race;
  latestRace?: LatestRaceResults;
  driverStandings: Standing[];
  constructorStandings: Standing[];
  qualifying: QualifyingResult[];
  latestRaceWinner?: RaceResult;
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
  fromCache?: boolean;
}
