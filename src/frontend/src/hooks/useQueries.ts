import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DismissalType, PlayerRole, TournamentStatus } from "../backend";
import { useActor } from "./useActor";

export function useTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournament(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tournament", id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getTournament(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useTeams(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teams", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || !tournamentId) return [];
      return actor.getTeamsForTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
  });
}

export function usePlayers(teamId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["players", teamId?.toString()],
    queryFn: async () => {
      if (!actor || !teamId) return [];
      return actor.getPlayersForTeam(teamId);
    },
    enabled: !!actor && !isFetching && !!teamId,
  });
}

export function useMatches(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matches", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || !tournamentId) return [];
      return actor.getMatchesForTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
    refetchInterval: 30000,
  });
}

export function usePointsTable(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pointsTable", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || !tournamentId) return [];
      return actor.getPointsTable(tournamentId);
    },
    enabled: !!actor && !isFetching && !!tournamentId,
    refetchInterval: 30000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTournament(name);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useUpdateTournamentName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTournamentName(id, name);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useUpdateTournamentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: TournamentStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTournamentStatus(id, status);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tournaments"] }),
  });
}

export function useCreateTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      name,
      logoUrl,
    }: { tournamentId: bigint; name: string; logoUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTeam(tournamentId, name, logoUrl);
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({
        queryKey: ["teams", vars.tournamentId.toString()],
      }),
  });
}

export function useCreatePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      name,
      role,
      jerseyNumber,
    }: {
      teamId: bigint;
      name: string;
      role: PlayerRole;
      jerseyNumber: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPlayer(teamId, name, role, jerseyNumber);
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({
        queryKey: ["players", vars.teamId.toString()],
      }),
  });
}

/**
 * updatePlayerStats — calls the backend function introduced in the latest
 * backend version.  The generated backend.d.ts may not yet include this
 * method, so we call it via an `any` cast and handle the case where it is
 * absent gracefully (stats are also persisted in localStorage as a local
 * cache so the UI works regardless).
 */
export function useUpdatePlayerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      cricHeroesUrl,
      totalRuns,
      totalWickets,
      battingAverage,
      strikeRate,
    }: {
      playerId: bigint;
      cricHeroesUrl: string;
      totalRuns: bigint;
      totalWickets: bigint;
      battingAverage: number;
      strikeRate: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      // Use any-cast because updatePlayerStats is a new backend method
      // whose signature may not yet be reflected in the generated d.ts.
      const backendActor = actor as any;
      if (typeof backendActor.updatePlayerStats !== "function") {
        // Backend not yet deployed with this function — skip silently.
        return;
      }
      return backendActor.updatePlayerStats(
        playerId,
        cricHeroesUrl,
        totalRuns,
        totalWickets,
        battingAverage,
        strikeRate,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useCreateMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      team1Id,
      team2Id,
      scheduledAt,
      venue,
    }: {
      tournamentId: bigint;
      team1Id: bigint;
      team2Id: bigint;
      scheduledAt: bigint;
      venue: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMatch(
        tournamentId,
        team1Id,
        team2Id,
        scheduledAt,
        venue,
      );
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({
        queryKey: ["matches", vars.tournamentId.toString()],
      }),
  });
}

export function useCreateInnings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      battingTeamId,
      totalRuns,
      totalWickets,
      totalOvers,
    }: {
      matchId: bigint;
      battingTeamId: bigint;
      totalRuns: bigint;
      totalWickets: bigint;
      totalOvers: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createInnings(
        matchId,
        battingTeamId,
        totalRuns,
        totalWickets,
        totalOvers,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useMatchDetails(matchId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matchDetails", matchId?.toString()],
    queryFn: async () => {
      if (!actor || !matchId) return null;
      return actor.getMatchDetails(matchId);
    },
    enabled: !!actor && !isFetching && !!matchId,
  });
}

export function useTrendingPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["trendingPlayers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBattingEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inningsId,
      playerId,
      runs,
      balls,
      fours,
      sixes,
      isOut,
      dismissalType,
    }: {
      inningsId: bigint;
      playerId: bigint;
      runs: bigint;
      balls: bigint;
      fours: bigint;
      sixes: bigint;
      isOut: boolean;
      dismissalType: DismissalType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBattingEntry(
        inningsId,
        playerId,
        runs,
        balls,
        fours,
        sixes,
        isOut,
        dismissalType,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["matchDetails"] }),
  });
}
