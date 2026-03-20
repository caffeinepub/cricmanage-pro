import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Share2,
  Star,
  Swords,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Match } from "../backend";
import { MatchStatus } from "../backend";
import { CommsTab } from "../components/match/CommsTab";
import { ScorecardTab } from "../components/match/ScorecardTab";
import { useAppContext } from "../context/AppContext";
import type { UserRole } from "../context/AppContext";
import {
  useCreateMatch,
  useIsAdmin,
  useMatches,
  useTeams,
  useTournaments,
} from "../hooks/useQueries";

const STATUS_CONFIG = {
  [MatchStatus.live]: {
    label: "Live",
    className: "bg-cricket-green/20 text-cricket-green border-cricket-green/30",
  },
  [MatchStatus.scheduled]: {
    label: "Upcoming",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  [MatchStatus.completed]: {
    label: "Completed",
    className: "bg-muted/30 text-muted-foreground border-cricket-border",
  },
};

const ROUND_LABELS = [
  "Final",
  "Semi Final",
  "Quarter Final",
  "League",
  "Super Over",
];

const ROLE_LABELS: Record<string, string> = {
  viewer: "Viewer",
  player: "Player",
  umpire: "Umpire",
  franchisee: "Franchisee",
};

// Demo data for leaderboard, heroes and points table
const DEMO_LEADERBOARD = [
  {
    rank: 1,
    player: "Virat Kohli",
    team: "Mumbai Titans",
    runs: 487,
    sr: 148.6,
    avg: 54.1,
  },
  {
    rank: 2,
    player: "Rohit Sharma",
    team: "Delhi Daredevils",
    runs: 421,
    sr: 142.2,
    avg: 48.0,
  },
  {
    rank: 3,
    player: "MS Dhoni",
    team: "Chennai Kings",
    runs: 395,
    sr: 156.3,
    avg: 45.5,
  },
  {
    rank: 4,
    player: "KL Rahul",
    team: "Hyderabad Hawks",
    runs: 372,
    sr: 138.5,
    avg: 41.3,
  },
  {
    rank: 5,
    player: "Suryakumar Yadav",
    team: "Mumbai Titans",
    runs: 356,
    sr: 167.9,
    avg: 39.5,
  },
  {
    rank: 6,
    player: "Shubman Gill",
    team: "Gujarat Giants",
    runs: 334,
    sr: 133.6,
    avg: 37.1,
  },
];

const DEMO_HEROES = [
  {
    id: 1,
    name: "Virat Kohli",
    team: "Mumbai Titans",
    mvp: 92.4,
    batting: "87(52) · 4×8 · 6×3",
    bowling: "2-0-14-1",
    color: "oklch(0.55 0.18 152)",
  },
  {
    id: 2,
    name: "Jasprit Bumrah",
    team: "Mumbai Titans",
    mvp: 88.7,
    batting: "18(12) · 4×2",
    bowling: "4-0-22-4",
    color: "oklch(0.55 0.19 250)",
  },
  {
    id: 3,
    name: "MS Dhoni",
    team: "Chennai Kings",
    mvp: 85.2,
    batting: "64(38) · 4×4 · 6×5",
    bowling: "0-0-0-0",
    color: "oklch(0.60 0.18 50)",
  },
  {
    id: 4,
    name: "Yuzvendra Chahal",
    team: "Delhi Daredevils",
    mvp: 82.5,
    batting: "8(5) · 6×1",
    bowling: "4-0-26-3",
    color: "oklch(0.58 0.20 280)",
  },
];

const DEMO_POINTS = [
  {
    pos: 1,
    team: "Mumbai Titans",
    p: 8,
    w: 6,
    l: 1,
    nr: 1,
    pts: 13,
    nrr: "+1.42",
  },
  {
    pos: 2,
    team: "Chennai Kings",
    p: 8,
    w: 5,
    l: 2,
    nr: 1,
    pts: 11,
    nrr: "+0.87",
  },
  {
    pos: 3,
    team: "Delhi Daredevils",
    p: 8,
    w: 4,
    l: 3,
    nr: 1,
    pts: 9,
    nrr: "+0.21",
  },
  {
    pos: 4,
    team: "Hyderabad Hawks",
    p: 8,
    w: 3,
    l: 4,
    nr: 1,
    pts: 7,
    nrr: "-0.34",
  },
  {
    pos: 5,
    team: "Gujarat Giants",
    p: 8,
    w: 2,
    l: 5,
    nr: 1,
    pts: 5,
    nrr: "-0.92",
  },
  {
    pos: 6,
    team: "Kolkata Knights",
    p: 8,
    w: 1,
    l: 7,
    nr: 0,
    pts: 2,
    nrr: "-1.61",
  },
];

// Match detail demo data
const MATCH_DETAIL_DEMO = {
  insight:
    "Mumbai Titans scored 26 runs in singles, 15 less than Chennai Kings in the same overs.",
  team1: { name: "Mumbai Titans", score: "182/4", overs: "20.0 Ov" },
  team2: { name: "Chennai Kings", score: "181/7", overs: "20.0 Ov" },
  result: "MUMBAI TITANS won by 1 run",
  hero: {
    name: "Virat Kohli",
    team: "Mumbai Titans",
    mvp: "92.4",
    batting: "87(52) 4s:8 6s:3",
    bowling: "2-0-14-1",
  },
};

interface ScoreState {
  runs: string;
  wickets: string;
  overs: string;
}

function MatchDetailSheet({
  match,
  teams,
  open,
  onClose,
  roundLabel,
  userRole,
}: {
  match: Match | null;
  teams: { id: bigint; name: string }[];
  open: boolean;
  onClose: () => void;
  roundLabel: string;
  userRole: UserRole | null;
}) {
  const team1 = teams.find((t) => t.id === match?.team1Id);
  const team2 = teams.find((t) => t.id === match?.team2Id);
  const isLive = match?.status === MatchStatus.live;
  const isScheduled = match?.status === MatchStatus.scheduled;

  const canScore = userRole === "scorer" || userRole === "organiser";
  const isReadOnly = !canScore;
  const roleLabel = userRole ? (ROLE_LABELS[userRole] ?? userRole) : "Guest";

  const [team1Score, setTeam1Score] = useState<ScoreState>({
    runs: "182",
    wickets: "4",
    overs: "20.0",
  });
  const [team2Score, setTeam2Score] = useState<ScoreState>({
    runs: "181",
    wickets: "7",
    overs: "20.0",
  });

  // Draft inputs
  const [draftT1, setDraftT1] = useState<ScoreState>({ ...team1Score });
  const [draftT2, setDraftT2] = useState<ScoreState>({ ...team2Score });

  function handleUpdateScore() {
    setTeam1Score({ ...draftT1 });
    setTeam2Score({ ...draftT2 });
    toast.success("Score updated!");
  }

  function handleMarkComplete() {
    toast.success("Match marked as complete");
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl border-cricket-border overflow-y-auto"
        style={{ background: "oklch(0.18 0.055 236)" }}
        data-ocid="matches.sheet"
      >
        <SheetHeader className="pb-4 border-b border-cricket-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground text-lg">
              {roundLabel}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge className="bg-cricket-green/20 text-cricket-green border-cricket-green/40 animate-pulse text-xs">
                  ● LIVE
                </Badge>
              )}
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                data-ocid="matches.detail.share.button"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="live" className="mt-4">
          <TabsList className="grid grid-cols-5 bg-secondary/40 border border-cricket-border rounded-lg mb-4">
            <TabsTrigger
              value="info"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Info
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Live
            </TabsTrigger>
            <TabsTrigger
              value="scorecard"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Scorecard
            </TabsTrigger>
            <TabsTrigger
              value="comms"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Comms
            </TabsTrigger>
            <TabsTrigger
              value="squads"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Squads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {/* Read-only banner for non-scorers */}
            {isReadOnly && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cricket-border"
                style={{ background: "oklch(0.20 0.04 240 / 0.6)" }}
                data-ocid="matches.detail.readonly.panel"
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Viewing as{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "oklch(0.75 0.12 240)" }}
                  >
                    {roleLabel}
                  </span>{" "}
                  · Read only
                </span>
              </motion.div>
            )}

            {/* Insight banner */}
            <div
              className="rounded-lg p-3 border border-cricket-green/30"
              style={{ background: "oklch(0.24 0.07 155 / 0.3)" }}
              data-ocid="matches.detail.insight.panel"
            >
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-cricket-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-cricket-green">
                  {MATCH_DETAIL_DEMO.insight}
                </p>
              </div>
            </div>

            {/* Team scores */}
            <div
              className="rounded-xl border border-cricket-border p-4 space-y-3"
              style={{ background: "oklch(0.22 0.06 230)" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  {team1?.name || MATCH_DETAIL_DEMO.team1.name}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {team1Score.runs}/{team1Score.wickets}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({team1Score.overs} Ov)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  {team2?.name || MATCH_DETAIL_DEMO.team2.name}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {team2Score.runs}/{team2Score.wickets}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({team2Score.overs} Ov)
                </span>
              </div>
              <div className="pt-2 border-t border-cricket-border">
                <span className="text-xs font-bold text-cricket-green uppercase tracking-wide">
                  {MATCH_DETAIL_DEMO.result}
                </span>
              </div>
            </div>

            {/* Live Score Entry — scorer/organiser only */}
            {canScore && (isLive || isScheduled) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-cricket-green/30 p-4 space-y-4"
                style={{ background: "oklch(0.22 0.06 230)" }}
                data-ocid="matches.detail.score_entry.panel"
              >
                <div className="flex items-center gap-2 pb-1 border-b border-cricket-border">
                  <Edit3 className="w-3.5 h-3.5 text-cricket-green" />
                  <span className="text-xs font-bold text-cricket-green uppercase tracking-widest">
                    Live Score Entry
                  </span>
                  {isLive && (
                    <Badge className="ml-auto text-[9px] bg-cricket-green/20 text-cricket-green border-cricket-green/30 animate-pulse">
                      ● LIVE
                    </Badge>
                  )}
                </div>

                {/* Team 1 score row */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-muted-foreground truncate">
                    {team1?.name || MATCH_DETAIL_DEMO.team1.name}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Runs
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={draftT1.runs}
                        onChange={(e) =>
                          setDraftT1((prev) => ({
                            ...prev,
                            runs: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team1_runs.input"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Wkts
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={draftT1.wickets}
                        onChange={(e) =>
                          setDraftT1((prev) => ({
                            ...prev,
                            wickets: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team1_wickets.input"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Overs
                      </Label>
                      <Input
                        type="text"
                        placeholder="18.3"
                        value={draftT1.overs}
                        onChange={(e) =>
                          setDraftT1((prev) => ({
                            ...prev,
                            overs: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team1_overs.input"
                      />
                    </div>
                  </div>
                </div>

                {/* Team 2 score row */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-muted-foreground truncate">
                    {team2?.name || MATCH_DETAIL_DEMO.team2.name}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Runs
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={draftT2.runs}
                        onChange={(e) =>
                          setDraftT2((prev) => ({
                            ...prev,
                            runs: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team2_runs.input"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Wkts
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={draftT2.wickets}
                        onChange={(e) =>
                          setDraftT2((prev) => ({
                            ...prev,
                            wickets: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team2_wickets.input"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-1 block">
                        Overs
                      </Label>
                      <Input
                        type="text"
                        placeholder="18.3"
                        value={draftT2.overs}
                        onChange={(e) =>
                          setDraftT2((prev) => ({
                            ...prev,
                            overs: e.target.value,
                          }))
                        }
                        className="h-8 text-sm bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.detail.team2_overs.input"
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleUpdateScore}
                    size="sm"
                    className="flex-1 bg-cricket-green hover:bg-cricket-green/90 text-white text-xs"
                    data-ocid="matches.detail.update_score.button"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Update Score
                  </Button>
                  <Button
                    onClick={handleMarkComplete}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-cricket-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 text-xs"
                    data-ocid="matches.detail.mark_complete.button"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Mark Complete
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Shortcuts */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-cricket-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" /> Points Table
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-cricket-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5" /> Leaderboard
              </button>
            </div>

            {/* Heroes of the match */}
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Heroes of the Match
              </h3>
              <div
                className="rounded-xl border border-cricket-border overflow-hidden"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <div
                  className="h-24 relative flex items-end p-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.28 0.12 152), oklch(0.20 0.08 240))",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <span className="text-7xl">🏏</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest z-10">
                    Player of the Match
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground text-base">
                      {MATCH_DETAIL_DEMO.hero.name}
                    </span>
                    <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/40 px-1.5">
                      PRO
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {MATCH_DETAIL_DEMO.hero.team}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {MATCH_DETAIL_DEMO.hero.mvp}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      MVP Score
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>
                      🏏 Batting:{" "}
                      <span className="text-foreground">
                        {MATCH_DETAIL_DEMO.hero.batting}
                      </span>
                    </div>
                    <div>
                      🎯 Bowling:{" "}
                      <span className="text-foreground">
                        {MATCH_DETAIL_DEMO.hero.bowling}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div
              className="rounded-xl border border-cricket-border p-4"
              style={{ background: "oklch(0.22 0.06 230)" }}
            >
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Type</span>
                  <span className="text-foreground font-medium">
                    {roundLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="text-foreground font-medium">
                    {match?.venue || "Wankhede Stadium"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="text-foreground font-medium">T20</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scorecard">
            <ScorecardTab
              matchId={match?.id.toString() ?? "match-1"}
              team1Name={team1?.name ?? "Team 1"}
              team2Name={team2?.name ?? "Team 2"}
            />
          </TabsContent>

          <TabsContent value="comms">
            <CommsTab
              matchId={match?.id.toString() ?? "match-1"}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="squads">
            <div
              className="rounded-xl border border-cricket-border p-12 text-center"
              style={{ background: "oklch(0.22 0.06 230)" }}
            >
              <p className="text-muted-foreground text-sm">
                Squads coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function MatchCard({
  match,
  teams,
  index,
  onSelect,
}: {
  match: Match;
  teams: { id: bigint; name: string }[];
  index: number;
  onSelect: (m: Match) => void;
}) {
  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);
  const date = new Date(Number(match.scheduledAt / BigInt(1_000_000)));
  const status = STATUS_CONFIG[match.status] ?? {
    label: "Unknown",
    className: "bg-muted/30 text-muted-foreground border-cricket-border",
  };
  const isLive = match.status === MatchStatus.live;
  const isCompleted = match.status === MatchStatus.completed;
  const roundLabel = ROUND_LABELS[index % ROUND_LABELS.length];

  // Demo scores for completed matches
  const demoScores = [
    { t1: "152/7", t2: "151/9", result: "won by 1 run" },
    { t1: "186/4", t2: "178/6", result: "won by 8 runs" },
    { t1: "201/3", t2: "165/8", result: "won by 36 runs" },
  ];
  const demo = demoScores[index % demoScores.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-cricket-border p-4 shadow-card cursor-pointer hover:border-cricket-green/40 transition-colors"
      style={{ background: "oklch(0.22 0.06 230)" }}
      data-ocid={`matches.item.${index + 1}`}
      onClick={() => onSelect(match)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {roundLabel}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "oklch(0.14 0.04 240)",
              color: "oklch(0.80 0.03 240)",
            }}
          >
            {isLive ? "LIVE" : isCompleted ? "RESULT" : "SCHEDULED"}
          </span>
        </div>
        <Badge
          className={`text-xs ${status.className} ${isLive ? "animate-pulse" : ""}`}
        >
          {isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-cricket-green mr-1 inline-block" />
          )}
          {status.label}
        </Badge>
      </div>

      {/* Subtitle */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date.toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span>·</span>
        <span>T20</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {match.venue}
        </span>
      </div>

      {/* Team scores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            {team1?.name || "TBD"}
          </span>
          {isCompleted && (
            <span className="text-sm font-bold text-foreground">
              {demo.t1} (20.0 Ov)
            </span>
          )}
          {isLive && (
            <span className="text-sm font-bold text-cricket-green">
              182/4 (18.2 Ov)
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            {team2?.name || "TBD"}
          </span>
          {isCompleted && (
            <span className="text-sm font-bold text-muted-foreground">
              {demo.t2} (20.0 Ov)
            </span>
          )}
          {isLive && (
            <span className="text-sm font-bold text-muted-foreground">
              Yet to bat
            </span>
          )}
        </div>
      </div>

      {/* Result */}
      {isCompleted && (
        <div className="mt-3 pt-3 border-t border-cricket-border">
          <span className="text-xs font-bold text-cricket-green uppercase tracking-wide">
            {team1?.name || "THE TITANS"} {demo.result}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function Matches() {
  const [open, setOpen] = useState(false);
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [venue, setVenue] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [liveFilter, setLiveFilter] = useState<"Live" | "Upcoming" | "Past">(
    "Upcoming",
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { selectedTournament, userRole } = useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [] } = useTeams(activeTournament?.id ?? null);
  const { data: matches = [], isLoading } = useMatches(
    activeTournament?.id ?? null,
  );
  const { data: isAdmin = false } = useIsAdmin();
  const createMatch = useCreateMatch();

  function getFilteredMatches() {
    switch (liveFilter) {
      case "Live":
        return matches.filter((m) => m.status === MatchStatus.live);
      case "Past":
        return matches.filter((m) => m.status === MatchStatus.completed);
      default:
        return matches.filter((m) => m.status === MatchStatus.scheduled);
    }
  }

  const filteredMatches = getFilteredMatches();

  function handleSelectMatch(m: Match) {
    setSelectedMatch(m);
    setDetailOpen(true);
  }

  async function handleCreate() {
    if (!team1Id || !team2Id || !venue || !scheduledAt || !activeTournament)
      return;
    if (team1Id === team2Id) {
      toast.error("Teams must be different");
      return;
    }
    try {
      const ts = BigInt(new Date(scheduledAt).getTime()) * BigInt(1_000_000);
      await createMatch.mutateAsync({
        tournamentId: activeTournament.id,
        team1Id: BigInt(team1Id),
        team2Id: BigInt(team2Id),
        scheduledAt: ts,
        venue,
      });
      toast.success("Match scheduled!");
      setTeam1Id("");
      setTeam2Id("");
      setVenue("");
      setScheduledAt("");
      setOpen(false);
    } catch {
      toast.error("Failed to schedule match");
    }
  }

  const selectedIdx = selectedMatch
    ? matches.findIndex((m) => m.id === selectedMatch.id)
    : -1;
  const selectedRound = selectedMatch
    ? ROUND_LABELS[(selectedIdx >= 0 ? selectedIdx : 0) % ROUND_LABELS.length]
    : "Match Detail";

  return (
    <div className="space-y-6">
      {/* Tournament header */}
      <div
        className="rounded-xl border border-cricket-border p-5"
        style={{ background: "oklch(0.22 0.06 230)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {activeTournament ? activeTournament.name : "Matches"}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Mar 2026 – Apr 2026
              </span>
              <span>·</span>
              <span>1.2K views</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-cricket-green/40 text-cricket-green hover:bg-cricket-green/10 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Insights
            </button>
            {isAdmin && activeTournament && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-cricket-green hover:bg-cricket-green/90 text-white rounded-full"
                    data-ocid="matches.add.button"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="bg-card border-cricket-border sm:max-w-md"
                  data-ocid="matches.add.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="text-foreground">
                      Schedule New Match
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Team 1</Label>
                      <Select value={team1Id} onValueChange={setTeam1Id}>
                        <SelectTrigger
                          className="bg-secondary border-cricket-border text-foreground"
                          data-ocid="matches.team1.select"
                        >
                          <SelectValue placeholder="Select Team 1" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-cricket-border">
                          {teams.map((t) => (
                            <SelectItem
                              key={t.id.toString()}
                              value={t.id.toString()}
                            >
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Team 2</Label>
                      <Select value={team2Id} onValueChange={setTeam2Id}>
                        <SelectTrigger
                          className="bg-secondary border-cricket-border text-foreground"
                          data-ocid="matches.team2.select"
                        >
                          <SelectValue placeholder="Select Team 2" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-cricket-border">
                          {teams.map((t) => (
                            <SelectItem
                              key={t.id.toString()}
                              value={t.id.toString()}
                            >
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Venue</Label>
                      <Input
                        placeholder="e.g. Wankhede Stadium, Mumbai"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.venue.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Date &amp; Time</Label>
                      <Input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground"
                        data-ocid="matches.date.input"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="border-cricket-border"
                      data-ocid="matches.create.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={
                        createMatch.isPending ||
                        !team1Id ||
                        !team2Id ||
                        !venue ||
                        !scheduledAt
                      }
                      className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                      data-ocid="matches.create.submit_button"
                    >
                      {createMatch.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="matches">
        <TabsList className="bg-secondary/40 border border-cricket-border rounded-lg">
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="matches.matches.tab"
          >
            Matches
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="matches.leaderboard.tab"
          >
            Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="heroes"
            className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="matches.heroes.tab"
          >
            Heroes
          </TabsTrigger>
          <TabsTrigger
            value="points"
            className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="matches.points.tab"
          >
            Points Table
          </TabsTrigger>
        </TabsList>

        {/* Matches tab */}
        <TabsContent value="matches" className="space-y-4 mt-4">
          {/* Live/Upcoming/Past toggle */}
          <div
            className="flex items-center gap-2"
            data-ocid="matches.filter.tab"
          >
            {(["Live", "Upcoming", "Past"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setLiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  liveFilter === f
                    ? "bg-cricket-green text-white border-cricket-green"
                    : "bg-secondary/60 text-muted-foreground border-cricket-border hover:text-foreground"
                }`}
              >
                {f === "Live" && liveFilter === "Live" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />
                )}
                {f}
              </button>
            ))}
          </div>

          {!activeTournament ? (
            <div
              className="rounded-xl border border-cricket-border p-12 text-center"
              style={{ background: "oklch(0.22 0.06 230)" }}
              data-ocid="matches.empty_state"
            >
              <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No tournament selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select a tournament to view matches.
              </p>
            </div>
          ) : isLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="matches.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-cricket-green" />
            </div>
          ) : filteredMatches.length === 0 ? (
            <div
              className="rounded-xl border border-cricket-border p-12 text-center"
              style={{ background: "oklch(0.22 0.06 230)" }}
              data-ocid="matches.empty_state"
            >
              <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No {liveFilter.toLowerCase()} matches
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Schedule your first match."
                  : "No matches available."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, i) => (
                  <MatchCard
                    key={match.id.toString()}
                    match={match}
                    teams={teams}
                    index={i}
                    onSelect={handleSelectMatch}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </TabsContent>

        {/* Leaderboard tab */}
        <TabsContent value="leaderboard" className="mt-4">
          <div
            className="rounded-xl border border-cricket-border overflow-hidden"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="px-5 py-4 border-b border-cricket-border">
              <h2 className="font-bold text-foreground">Batting Leaderboard</h2>
              <p className="text-xs text-muted-foreground">
                Top run-scorers in the tournament
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-cricket-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground w-12">
                    Rank
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Player
                  </TableHead>
                  <TableHead className="text-muted-foreground">Team</TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Runs
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    SR
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Avg
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_LEADERBOARD.map((row, i) => (
                  <motion.tr
                    key={row.player}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-cricket-border hover:bg-secondary/30"
                    data-ocid={`matches.leaderboard.item.${i + 1}`}
                  >
                    <TableCell>
                      {i === 0 ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                          🥇
                        </span>
                      ) : i === 1 ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 text-xs font-bold">
                          🥈
                        </span>
                      ) : i === 2 ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 text-xs font-bold">
                          🥉
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {row.rank}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {row.player}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.team}
                    </TableCell>
                    <TableCell className="text-right font-bold text-cricket-green">
                      {row.runs}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {row.sr}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {row.avg}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Heroes tab */}
        <TabsContent value="heroes" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_HEROES.map((hero, i) => (
              <motion.div
                key={hero.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-cricket-border overflow-hidden"
                style={{ background: "oklch(0.22 0.06 230)" }}
                data-ocid={`matches.heroes.item.${i + 1}`}
              >
                <div
                  className="h-20 flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${hero.color}, oklch(0.20 0.08 240))`,
                  }}
                >
                  <span className="text-4xl opacity-50">🏏</span>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="text-[9px] bg-amber-500/30 text-amber-300 border-amber-500/40">
                      MVP
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-foreground text-sm mb-0.5">
                    {hero.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {hero.team}
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">
                      {hero.mvp}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>🏏 {hero.batting}</div>
                    <div>🎯 {hero.bowling}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Points Table tab */}
        <TabsContent value="points" className="mt-4">
          <div
            className="rounded-xl border border-cricket-border overflow-hidden"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <div className="px-5 py-4 border-b border-cricket-border">
              <h2 className="font-bold text-foreground">Points Table</h2>
              <p className="text-xs text-muted-foreground">Current standings</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-cricket-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground w-8">#</TableHead>
                  <TableHead className="text-muted-foreground">Team</TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    P
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    W
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    L
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center">
                    NR
                  </TableHead>
                  <TableHead className="text-muted-foreground text-center font-bold">
                    Pts
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    NRR
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_POINTS.map((row, i) => (
                  <motion.tr
                    key={row.team}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-cricket-border hover:bg-secondary/30 ${
                      i < 4 ? "border-l-2 border-l-cricket-green" : ""
                    }`}
                    data-ocid={`matches.points.item.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground">
                      {row.pos}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {row.team}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.p}
                    </TableCell>
                    <TableCell className="text-center text-foreground">
                      {row.w}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.l}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.nr}
                    </TableCell>
                    <TableCell className="text-center font-bold text-cricket-green">
                      {row.pts}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        row.nrr.startsWith("+")
                          ? "text-cricket-green"
                          : "text-cricket-danger"
                      }`}
                    >
                      {row.nrr}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Match detail sheet */}
      <MatchDetailSheet
        match={selectedMatch}
        teams={teams}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        roundLabel={selectedRound}
        userRole={userRole}
      />
    </div>
  );
}
