import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: bigint;
    name: string;
    role: PlayerRole;
    jerseyNumber: bigint;
    teamId: bigint;
}
export interface PointsTableEntry {
    ties: bigint;
    wins: bigint;
    losses: bigint;
    netRunRate: number;
    matchesPlayed: bigint;
    teamId: bigint;
    points: bigint;
}
export type Timestamp = bigint;
export interface MatchDetails {
    match: Match;
    scorecard: MatchScorecard;
}
export interface Tournament {
    id: bigint;
    status: TournamentStatus;
    name: string;
    createdAt: Timestamp;
}
export interface Match {
    id: bigint;
    status: MatchStatus;
    venue: string;
    winnerId?: bigint;
    team1Id: bigint;
    team2Id: bigint;
    tournamentId: bigint;
    scheduledAt: Timestamp;
}
export interface TrendingPlayer {
    playerId: bigint;
    runs: bigint;
    wickets: bigint;
    tournamentId: bigint;
}
export interface MatchScorecard {
    team1Id: bigint;
    team2Id: bigint;
    team1Score: bigint;
    team2Score: bigint;
}
export interface UserProfile {
    name: string;
    role: Role;
}
export interface Team {
    id: bigint;
    name: string;
    logoUrl: string;
    tournamentId: bigint;
}
export enum DismissalType {
    lbw = "lbw",
    notOut = "notOut",
    runOut = "runOut",
    bowled = "bowled",
    hitWicket = "hitWicket",
    stumped = "stumped",
    caught = "caught"
}
export enum MatchStatus {
    scheduled = "scheduled",
    live = "live",
    completed = "completed"
}
export enum PlayerRole {
    bowler = "bowler",
    allrounder = "allrounder",
    wicketkeeper = "wicketkeeper",
    batsman = "batsman"
}
export enum Role {
    organiser = "organiser",
    franchisee = "franchisee",
    viewer = "viewer"
}
export enum TournamentStatus {
    active = "active",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBattingEntry(inningsId: bigint, playerId: bigint, runs: bigint, balls: bigint, fours: bigint, sixes: bigint, isOut: boolean, dismissalType: DismissalType): Promise<bigint>;
    createBowlingEntry(inningsId: bigint, playerId: bigint, overs: number, maidens: bigint, runs: bigint, wickets: bigint): Promise<bigint>;
    createInnings(matchId: bigint, battingTeamId: bigint, totalRuns: bigint, totalWickets: bigint, totalOvers: number): Promise<bigint>;
    createMatch(tournamentId: bigint, team1Id: bigint, team2Id: bigint, scheduledAt: Timestamp, venue: string): Promise<bigint>;
    createPlayer(teamId: bigint, name: string, role: PlayerRole, jerseyNumber: bigint): Promise<bigint>;
    createTeam(tournamentId: bigint, name: string, logoUrl: string): Promise<bigint>;
    createTournament(name: string): Promise<bigint>;
    getCallerRole(): Promise<Role | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMatchDetails(matchId: bigint): Promise<MatchDetails>;
    getMatchesForTournament(tournamentId: bigint): Promise<Array<Match>>;
    getPlayersForTeam(teamId: bigint): Promise<Array<Player>>;
    getPointsTable(tournamentId: bigint): Promise<Array<PointsTableEntry>>;
    getTeamsForTournament(tournamentId: bigint): Promise<Array<Team>>;
    getTournament(id: bigint): Promise<Tournament | null>;
    getTournaments(): Promise<Array<Tournament>>;
    getTrendingPlayers(): Promise<Array<TrendingPlayer>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserRole(role: Role): Promise<void>;
    updateTournamentName(id: bigint, name: string): Promise<void>;
    updateTournamentStatus(id: bigint, status: TournamentStatus): Promise<void>;
}
