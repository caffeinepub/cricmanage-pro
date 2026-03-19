import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MoreHorizontal,
  Radio,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Match, PointsTableEntry, Team } from "../backend";
import { MatchStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useMatches,
  usePointsTable,
  useTeams,
  useTournaments,
} from "../hooks/useQueries";

const DEMO_TEAMS = [
  { abbr: "MI", name: "Mumbai Indians", emoji: "🔵", w: 7, l: 3 },
  { abbr: "CSK", name: "Chennai Super Kings", emoji: "🟡", w: 6, l: 4 },
  { abbr: "RCB", name: "Royal Challengers", emoji: "🔴", w: 5, l: 5 },
  { abbr: "KKR", name: "Kolkata Knight Riders", emoji: "🟣", w: 8, l: 2 },
];

const DEMO_POINTS = [
  { rank: 1, team: "KKR", p: 10, w: 8, l: 2, nrr: "+1.24", pts: 16 },
  { rank: 2, team: "MI", p: 10, w: 7, l: 3, nrr: "+0.87", pts: 14 },
  { rank: 3, team: "CSK", p: 10, w: 6, l: 4, nrr: "+0.42", pts: 12 },
  { rank: 4, team: "RCB", p: 10, w: 5, l: 5, nrr: "-0.15", pts: 10 },
];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cricket-border p-4 shadow-card"
      style={{ background: "oklch(0.22 0.06 230)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}33` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </motion.div>
  );
}

function TeamCard({
  team,
  onManage,
}: {
  team: { abbr: string; name: string; emoji: string; w: number; l: number };
  onManage: () => void;
}) {
  return (
    <div
      className="p-3 rounded-xl border border-cricket-border"
      style={{ background: "oklch(0.25 0.06 228)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl">
          {team.emoji}
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{team.abbr}</div>
          <div className="text-xs text-muted-foreground truncate w-24">
            {team.name}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        <span className="text-cricket-green font-semibold">W: {team.w}</span>
        <span className="text-cricket-danger font-semibold">L: {team.l}</span>
      </div>
      <Button
        size="sm"
        onClick={onManage}
        className="w-full h-7 text-xs bg-cricket-green hover:bg-cricket-green/90 text-white rounded-lg"
      >
        Manage Team
      </Button>
    </div>
  );
}

function LiveScorecard({ match, teams }: { match: Match; teams: Team[] }) {
  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);
  return (
    <div>
      <div className="text-lg font-bold text-foreground mb-1">
        {team1?.name || "Team 1"} vs {team2?.name || "Team 2"}
      </div>
      <div className="text-sm text-muted-foreground mb-2">{match.venue}</div>
      <div className="text-2xl font-bold text-cricket-green mb-1">112/3</div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Ov: 14.2</span>
        <span>RR: 7.8</span>
      </div>
    </div>
  );
}

function PointsTableRow({
  entry,
  rank,
  teams,
}: {
  entry: PointsTableEntry;
  rank: number;
  teams: Team[];
}) {
  const team = teams.find((t) => t.id === entry.teamId);
  return (
    <tr className={`text-xs ${rank % 2 === 0 ? "bg-secondary/20" : ""}`}>
      <td className="px-3 py-2 text-muted-foreground font-medium">{rank}</td>
      <td className="px-3 py-2 text-foreground font-medium">
        {team?.name || `Team ${entry.teamId}`}
      </td>
      <td className="px-3 py-2 text-center text-muted-foreground">
        {entry.matchesPlayed.toString()}
      </td>
      <td className="px-3 py-2 text-center text-cricket-green font-semibold">
        {entry.wins.toString()}
      </td>
      <td className="px-3 py-2 text-center text-cricket-danger">
        {entry.losses.toString()}
      </td>
      <td className="px-3 py-2 text-center text-muted-foreground">
        {entry.netRunRate.toFixed(2)}
      </td>
      <td className="px-3 py-2 text-center text-foreground font-bold">
        {entry.points.toString()}
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const { selectedTournament, setCurrentPage } = useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [] } = useTeams(activeTournament?.id ?? null);
  const { data: matches = [] } = useMatches(activeTournament?.id ?? null);
  const { data: pointsTable = [] } = usePointsTable(
    activeTournament?.id ?? null,
  );

  const liveMatches = matches.filter((m) => m.status === MatchStatus.live);
  const upcomingMatches = matches.filter(
    (m) => m.status === MatchStatus.scheduled,
  );
  const totalPlayers = teams.length * 11;
  const tournamentTitle = activeTournament
    ? activeTournament.name
    : "IPL 2024: Season Overview";

  const displayTeams =
    teams.length > 0
      ? teams.slice(0, 4).map((t) => ({
          abbr: t.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 3)
            .toUpperCase(),
          name: t.name,
          emoji: "🏏",
          w: 5,
          l: 3,
        }))
      : DEMO_TEAMS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {tournamentTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Season Overview
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Teams"
          value={teams.length || 8}
          icon={Users}
          color="oklch(0.70 0.18 152)"
        />
        <StatCard
          label="Ongoing Matches"
          value={liveMatches.length || 2}
          icon={Radio}
          color="oklch(0.65 0.18 35)"
        />
        <StatCard
          label="Upcoming Matches"
          value={upcomingMatches.length || 12}
          icon={Calendar}
          color="oklch(0.60 0.15 260)"
        />
        <StatCard
          label="Players Registered"
          value={totalPlayers || 132}
          icon={UserCheck}
          color="oklch(0.72 0.18 80)"
        />
      </div>

      {/* Main 3-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Teams Grid */}
        <div>
          <div
            className="rounded-xl border border-cricket-border shadow-card"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-foreground">
                Tournament Teams
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                data-ocid="dashboard.teams.button"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {displayTeams.map((team, i) => (
                <div key={team.abbr} data-ocid={`dashboard.team.item.${i + 1}`}>
                  <TeamCard
                    team={team}
                    onManage={() => setCurrentPage("teams")}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Scorecard + Schedule */}
        <div className="space-y-4">
          {/* Live Scorecard */}
          <div
            className="rounded-xl border border-cricket-border shadow-card"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-foreground">
                Live Scorecard
              </span>
              <Badge className="bg-cricket-green/20 text-cricket-green border-cricket-green/30 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cricket-green mr-1 animate-pulse-dot inline-block" />
                Live
              </Badge>
            </div>
            <div className="px-4 pb-4">
              {liveMatches.length > 0 ? (
                <LiveScorecard match={liveMatches[0]} teams={teams} />
              ) : (
                <div className="py-2">
                  <div className="text-lg font-bold text-foreground mb-1">
                    MI vs CSK
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Wankhede Stadium, Mumbai
                  </div>
                  <div className="text-2xl font-bold text-cricket-green mb-1">
                    147/4
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Overs: 16.3</span>
                    <span>RR: 8.91</span>
                    <span>Need: 32 off 21</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-cricket-border">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Rohit Sharma</span>
                      <span className="text-foreground font-semibold">
                        65* (42)
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bumrah</span>
                      <span className="text-foreground font-semibold">
                        3-0-18-2
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div
            className="rounded-xl border border-cricket-border shadow-card"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-foreground">
                Upcoming Match Schedule
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4">
              {upcomingMatches.length > 0
                ? upcomingMatches.slice(0, 4).map((m, i) => {
                    const t1 = teams.find((t) => t.id === m.team1Id);
                    const t2 = teams.find((t) => t.id === m.team2Id);
                    const d = new Date(
                      Number(m.scheduledAt / BigInt(1_000_000)),
                    );
                    return (
                      <div
                        key={m.id.toString()}
                        data-ocid={`dashboard.match.item.${i + 1}`}
                        className="flex items-center justify-between py-2.5 border-b border-cricket-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-12">
                            {d.toLocaleDateString("en", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {t1?.name || "TBD"} vs {t2?.name || "TBD"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-cricket-border text-muted-foreground hover:text-foreground"
                        >
                          Manage
                        </Button>
                      </div>
                    );
                  })
                : [
                    { teams: "KKR vs RCB", date: "Mar 22" },
                    { teams: "DC vs PBKS", date: "Mar 23" },
                    { teams: "SRH vs RR", date: "Mar 24" },
                    { teams: "GT vs LSG", date: "Mar 25" },
                  ].map((m) => (
                    <div
                      key={m.teams}
                      className="flex items-center justify-between py-2.5 border-b border-cricket-border last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">
                          {m.date}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {m.teams}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-cricket-border text-muted-foreground hover:text-foreground"
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Right: Points Table */}
        <div>
          <div
            className="rounded-xl border border-cricket-border shadow-card"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-foreground">
                Points Table
              </span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-cricket-border">
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">
                      Team
                    </th>
                    <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                      P
                    </th>
                    <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                      W
                    </th>
                    <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                      L
                    </th>
                    <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                      NRR
                    </th>
                    <th className="px-3 py-2 text-center text-muted-foreground font-medium">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pointsTable.length > 0
                    ? pointsTable.map((entry, i) => (
                        <PointsTableRow
                          key={entry.teamId.toString()}
                          entry={entry}
                          rank={i + 1}
                          teams={teams}
                        />
                      ))
                    : DEMO_POINTS.map((row) => (
                        <tr
                          key={row.team}
                          className={`text-xs ${row.rank % 2 === 0 ? "bg-secondary/20" : ""}`}
                        >
                          <td className="px-3 py-2 text-muted-foreground font-medium">
                            {row.rank}
                          </td>
                          <td className="px-3 py-2 text-foreground font-semibold">
                            {row.team}
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {row.p}
                          </td>
                          <td className="px-3 py-2 text-center text-cricket-green font-semibold">
                            {row.w}
                          </td>
                          <td className="px-3 py-2 text-center text-cricket-danger">
                            {row.l}
                          </td>
                          <td className="px-3 py-2 text-center text-muted-foreground">
                            {row.nrr}
                          </td>
                          <td className="px-3 py-2 text-center text-foreground font-bold">
                            {row.pts}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
