import type React from "react";
import { createContext, useContext, useState } from "react";
import type { Tournament } from "../backend";

export type UserRole =
  | "organiser"
  | "franchisee"
  | "viewer"
  | "player"
  | "umpire"
  | "scorer";

const VALID_ROLES: UserRole[] = [
  "organiser",
  "franchisee",
  "viewer",
  "player",
  "umpire",
  "scorer",
];

type Page =
  | "dashboard"
  | "tournaments"
  | "teams"
  | "players"
  | "matches"
  | "looking"
  | "suggestions"
  | "login";

export interface BallEntry {
  id: string;
  over: number;
  ball: number;
  batsman: string;
  bowler: string;
  runs: number;
  extras: {
    type: "wide" | "no-ball" | "bye" | "leg-bye" | "none";
    count: number;
  };
  wicket?: {
    type:
      | "caught"
      | "bowled"
      | "lbw"
      | "run-out"
      | "stumped"
      | "hit-wicket"
      | "retired";
    fielder?: string;
  };
  timestamp: number;
}

export interface BatterRow {
  name: string;
  howOut: string;
  bowler: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
}

export interface BowlerRow {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
}

export interface InningsScorecard {
  battingRows: BatterRow[];
  bowlingRows: BowlerRow[];
  extras: number;
  total: number;
  overs: string;
}

export interface Scorecard {
  innings1: InningsScorecard;
  innings2: InningsScorecard;
}

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedTournament: Tournament | null;
  setSelectedTournament: (t: Tournament | null) => void;
  selectedTeamId: bigint | null;
  setSelectedTeamId: (id: bigint | null) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  matchCommentary: Record<string, BallEntry[]>;
  addBallEntry: (matchId: string, entry: BallEntry) => void;
  matchScorecards: Record<string, Scorecard>;
}

const SEED_INNINGS1: InningsScorecard = {
  battingRows: [
    {
      name: "Rohit Sharma",
      howOut: "c Dhoni b Jadeja",
      bowler: "R Jadeja",
      runs: 72,
      balls: 48,
      fours: 7,
      sixes: 3,
    },
    {
      name: "Shubman Gill",
      howOut: "lbw b Bumrah",
      bowler: "J Bumrah",
      runs: 11,
      balls: 14,
      fours: 1,
      sixes: 0,
    },
    {
      name: "Virat Kohli",
      howOut: "c Jadeja b Siraj",
      bowler: "M Siraj",
      runs: 87,
      balls: 52,
      fours: 8,
      sixes: 3,
    },
    {
      name: "Suryakumar Yadav",
      howOut: "run out (Hardik)",
      bowler: "-",
      runs: 34,
      balls: 18,
      fours: 2,
      sixes: 2,
    },
    {
      name: "Hardik Pandya",
      howOut: "not out",
      bowler: "-",
      runs: 22,
      balls: 14,
      fours: 1,
      sixes: 1,
    },
    {
      name: "Dinesh Karthik",
      howOut: "not out",
      bowler: "-",
      runs: 9,
      balls: 5,
      fours: 1,
      sixes: 0,
    },
  ],
  bowlingRows: [
    { name: "J Bumrah", overs: 4, maidens: 0, runs: 28, wickets: 1 },
    { name: "M Siraj", overs: 4, maidens: 0, runs: 37, wickets: 1 },
    { name: "R Jadeja", overs: 4, maidens: 0, runs: 31, wickets: 1 },
    { name: "H Pandya", overs: 4, maidens: 0, runs: 42, wickets: 0 },
    { name: "Y Chahal", overs: 4, maidens: 0, runs: 38, wickets: 1 },
  ],
  extras: 7,
  total: 242,
  overs: "20.0",
};

const SEED_INNINGS2: InningsScorecard = {
  battingRows: [
    {
      name: "MS Dhoni",
      howOut: "c Kohli b Bumrah",
      bowler: "J Bumrah",
      runs: 64,
      balls: 38,
      fours: 4,
      sixes: 5,
    },
    {
      name: "Faf du Plessis",
      howOut: "b Hardik",
      bowler: "H Pandya",
      runs: 48,
      balls: 36,
      fours: 4,
      sixes: 2,
    },
    {
      name: "Devon Conway",
      howOut: "lbw b Siraj",
      bowler: "M Siraj",
      runs: 33,
      balls: 28,
      fours: 3,
      sixes: 1,
    },
    {
      name: "Ruturaj Gaikwad",
      howOut: "c sub b Jadeja",
      bowler: "R Jadeja",
      runs: 27,
      balls: 22,
      fours: 3,
      sixes: 0,
    },
    {
      name: "Ambati Rayudu",
      howOut: "run out (Gill)",
      bowler: "-",
      runs: 14,
      balls: 11,
      fours: 1,
      sixes: 0,
    },
    {
      name: "Mitchell Santner",
      howOut: "not out",
      bowler: "-",
      runs: 8,
      balls: 7,
      fours: 0,
      sixes: 1,
    },
  ],
  bowlingRows: [
    { name: "J Bumrah", overs: 4, maidens: 0, runs: 26, wickets: 2 },
    { name: "M Siraj", overs: 4, maidens: 0, runs: 32, wickets: 1 },
    { name: "R Jadeja", overs: 4, maidens: 0, runs: 28, wickets: 1 },
    { name: "H Pandya", overs: 4, maidens: 0, runs: 35, wickets: 1 },
    { name: "Y Chahal", overs: 4, maidens: 0, runs: 40, wickets: 0 },
  ],
  extras: 6,
  total: 200,
  overs: "20.0",
};

const SEED_COMMENTARY: BallEntry[] = [
  {
    id: "ball-1",
    over: 19,
    ball: 6,
    batsman: "Hardik Pandya",
    bowler: "J Bumrah",
    runs: 6,
    extras: { type: "none", count: 0 },
    timestamp: Date.now() - 60000,
  },
  {
    id: "ball-2",
    over: 19,
    ball: 5,
    batsman: "Hardik Pandya",
    bowler: "J Bumrah",
    runs: 4,
    extras: { type: "none", count: 0 },
    timestamp: Date.now() - 120000,
  },
  {
    id: "ball-3",
    over: 19,
    ball: 4,
    batsman: "Dinesh Karthik",
    bowler: "J Bumrah",
    runs: 1,
    extras: { type: "none", count: 0 },
    timestamp: Date.now() - 180000,
  },
  {
    id: "ball-4",
    over: 19,
    ball: 3,
    batsman: "Dinesh Karthik",
    bowler: "J Bumrah",
    runs: 0,
    extras: { type: "wide", count: 1 },
    timestamp: Date.now() - 240000,
  },
  {
    id: "ball-5",
    over: 19,
    ball: 2,
    batsman: "Hardik Pandya",
    bowler: "J Bumrah",
    runs: 0,
    extras: { type: "none", count: 0 },
    wicket: { type: "caught", fielder: "Dhoni" },
    timestamp: Date.now() - 300000,
  },
  {
    id: "ball-6",
    over: 18,
    ball: 6,
    batsman: "Suryakumar Yadav",
    bowler: "Y Chahal",
    runs: 4,
    extras: { type: "none", count: 0 },
    timestamp: Date.now() - 360000,
  },
];

const SEED_MATCH_ID = "match-1";

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<bigint | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem("cricmanage_role") as UserRole | null;
    if (stored && VALID_ROLES.includes(stored)) {
      return stored;
    }
    return null;
  });
  const [matchCommentary, setMatchCommentary] = useState<
    Record<string, BallEntry[]>
  >({
    [SEED_MATCH_ID]: SEED_COMMENTARY,
  });
  const [matchScorecards] = useState<Record<string, Scorecard>>({
    [SEED_MATCH_ID]: {
      innings1: SEED_INNINGS1,
      innings2: SEED_INNINGS2,
    },
  });

  function setUserRole(role: UserRole | null) {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem("cricmanage_role", role);
    } else {
      localStorage.removeItem("cricmanage_role");
    }
  }

  function addBallEntry(matchId: string, entry: BallEntry) {
    setMatchCommentary((prev) => ({
      ...prev,
      [matchId]: [entry, ...(prev[matchId] ?? [])],
    }));
  }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedTournament,
        setSelectedTournament,
        selectedTeamId,
        setSelectedTeamId,
        userRole,
        setUserRole,
        matchCommentary,
        addBallEntry,
        matchScorecards,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
