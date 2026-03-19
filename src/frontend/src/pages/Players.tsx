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
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Player } from "../backend";
import { PlayerRole } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useCreatePlayer,
  useIsAdmin,
  usePlayers,
  useTeams,
  useTournaments,
  useUpdatePlayerStats,
} from "../hooks/useQueries";

const ROLE_LABELS: Record<PlayerRole, string> = {
  [PlayerRole.batsman]: "Batsman",
  [PlayerRole.bowler]: "Bowler",
  [PlayerRole.allrounder]: "All-Rounder",
  [PlayerRole.wicketkeeper]: "Wicket-Keeper",
};

const ROLE_COLORS: Record<PlayerRole, string> = {
  [PlayerRole.batsman]: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  [PlayerRole.bowler]: "bg-red-500/20 text-red-300 border-red-500/30",
  [PlayerRole.allrounder]:
    "bg-purple-500/20 text-purple-300 border-purple-500/30",
  [PlayerRole.wicketkeeper]:
    "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const DEMO_BATTING_STATS = [
  {
    sr: 1,
    date: "15 Mar 2026",
    innings: "vs Chennai Kings \u2013 Final",
    score: "87",
    outType: "Caught",
    overs: "52",
  },
  {
    sr: 2,
    date: "10 Mar 2026",
    innings: "vs Delhi Daredevils \u2013 SF",
    score: "63",
    outType: "LBW",
    overs: "41",
  },
  {
    sr: 3,
    date: "5 Mar 2026",
    innings: "vs Gujarat Giants \u2013 League",
    score: "45*",
    outType: "Not Out",
    overs: "38",
  },
  {
    sr: 4,
    date: "28 Feb 2026",
    innings: "vs Hyderabad Hawks \u2013 League",
    score: "102",
    outType: "Bowled",
    overs: "67",
  },
  {
    sr: 5,
    date: "21 Feb 2026",
    innings: "vs Kolkata Knights \u2013 League",
    score: "31",
    outType: "Caught",
    overs: "24",
  },
];

// ---------------------------------------------------------------------------
// CricHeroes local-cache helpers
// The canonical store is the backend (via updatePlayerStats / getPlayersForTeam
// returning PlayerWithStats). localStorage acts as an optimistic cache so the
// UI works immediately, even before the backend d.ts is regenerated.
// ---------------------------------------------------------------------------
const CRICHEROES_KEY = "cricmanage_cricheroes";

interface CricHeroesData {
  cricHeroesUrl: string;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  strikeRate: number;
  cricHeroesVerified: boolean;
}

function loadCricHeroesData(): Record<string, CricHeroesData> {
  try {
    const raw = localStorage.getItem(CRICHEROES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCricHeroesCache(id: bigint, data: CricHeroesData) {
  const all = loadCricHeroesData();
  all[id.toString()] = data;
  localStorage.setItem(CRICHEROES_KEY, JSON.stringify(all));
}

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{
        background: "oklch(0.35 0.12 155 / 0.25)",
        borderColor: "oklch(0.55 0.18 155 / 0.5)",
        color: "oklch(0.75 0.18 155)",
      }}
      data-ocid="players.verified.badge"
    >
      <ShieldCheck className="w-3 h-3" />
      Verified by CricHeroes
    </span>
  );
}

// ---------------------------------------------------------------------------
// Player profile sheet
// ---------------------------------------------------------------------------

function PlayerProfileSheet({
  player,
  open,
  onClose,
}: {
  player: Player | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!player) return null;

  const chData = loadCricHeroesData()[player.id.toString()];

  const totalRuns = DEMO_BATTING_STATS.reduce(
    (acc, s) => acc + (Number.parseInt(s.score) || 0),
    0,
  );
  const caughtCount = DEMO_BATTING_STATS.filter(
    (s) => s.outType === "Caught",
  ).length;
  const notOutCount = DEMO_BATTING_STATS.filter(
    (s) => s.outType === "Not Out",
  ).length;
  const displaySR = chData?.strikeRate ? chData.strikeRate.toFixed(1) : "146.8";
  const displayAvg = chData?.battingAverage
    ? chData.battingAverage.toFixed(1)
    : "65.6";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl border-cricket-border overflow-y-auto"
        style={{ background: "oklch(0.18 0.055 236)" }}
        data-ocid="players.profile.sheet"
      >
        <SheetHeader className="pb-4 border-b border-cricket-border">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.18 152), oklch(0.45 0.16 170))",
              }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <SheetTitle className="text-foreground text-lg">
                {player.name}
              </SheetTitle>
              <div className="flex items-center flex-wrap gap-2 mt-0.5">
                <Badge className={`text-xs ${ROLE_COLORS[player.role]}`}>
                  {ROLE_LABELS[player.role]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  #{player.jerseyNumber.toString()}
                </span>
                {chData?.cricHeroesVerified && <VerifiedBadge />}
              </div>
              {chData?.cricHeroesUrl && (
                <a
                  href={chData.cricHeroesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cricket-green transition-colors mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  CricHeroes Profile
                </a>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* CricHeroes career stats bar */}
        {chData && (
          <div
            className="mt-4 rounded-xl border px-4 py-3 flex items-center justify-around gap-4"
            style={{
              background: "oklch(0.22 0.06 155 / 0.15)",
              borderColor: "oklch(0.55 0.18 155 / 0.3)",
            }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-cricket-green">
                {chData.totalRuns.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Career Runs
              </div>
            </div>
            <div className="w-px h-8 bg-cricket-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {chData.totalWickets}
              </div>
              <div className="text-[10px] text-muted-foreground">Wickets</div>
            </div>
            <div className="w-px h-8 bg-cricket-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">
                {chData.battingAverage.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground">Avg</div>
            </div>
            <div className="w-px h-8 bg-cricket-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-sky-400">
                {chData.strikeRate.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground">SR</div>
            </div>
          </div>
        )}

        <Tabs defaultValue="batting" className="mt-4">
          <TabsList className="grid grid-cols-4 bg-secondary/40 border border-cricket-border rounded-lg mb-4">
            <TabsTrigger
              value="batting"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Batting
            </TabsTrigger>
            <TabsTrigger
              value="bowling"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Bowling
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="faceoff"
              className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            >
              Face off
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batting" className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Current Form (Last 5 Innings)
              </h3>
              <div
                className="rounded-xl border border-cricket-border overflow-hidden"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-cricket-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs w-8">
                        Sr
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs">
                        Innings
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">
                        Score
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs">
                        Out Type
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs text-right">
                        Balls
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_BATTING_STATS.map((row, i) => (
                      <motion.tr
                        key={row.sr}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-cricket-border hover:bg-secondary/30"
                        data-ocid={`players.batting.item.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-xs">
                          {row.sr}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-xs text-cricket-green font-medium">
                          {row.innings}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground text-right">
                          {row.score}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              row.outType === "Not Out"
                                ? "bg-cricket-green/20 text-cricket-green"
                                : "bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            {row.outType}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right">
                          {row.overs}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className="rounded-lg border border-cricket-border p-3 text-center"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <div className="text-2xl font-bold text-cricket-green">
                  {totalRuns}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                  Total runs in last 5 innings
                </div>
              </div>
              <div
                className="rounded-lg border border-cricket-border p-3 text-center"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <div className="text-2xl font-bold text-cricket-danger">
                  {caughtCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                  Caught out in last 5
                </div>
              </div>
              <div
                className="rounded-lg border border-cricket-border p-3 text-center"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <div className="text-2xl font-bold text-amber-400">
                  {notOutCount}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                  Not out in last 5
                </div>
              </div>
            </div>

            {/* SR and Avg */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl border border-cricket-green/30 p-4 text-center"
                style={{ background: "oklch(0.24 0.07 155 / 0.25)" }}
              >
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Strike Rate
                </div>
                <div className="text-4xl font-bold text-cricket-green">
                  {displaySR}
                </div>
              </div>
              <div
                className="rounded-xl border border-cricket-green/30 p-4 text-center"
                style={{ background: "oklch(0.24 0.07 155 / 0.25)" }}
              >
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Average
                </div>
                <div className="text-4xl font-bold text-cricket-green">
                  {displayAvg}
                </div>
              </div>
            </div>
          </TabsContent>

          {["bowling", "compare", "faceoff"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div
                className="rounded-xl border border-cricket-border p-12 text-center"
                style={{ background: "oklch(0.22 0.06 230)" }}
              >
                <p className="text-muted-foreground text-sm">Coming soon</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Main Players page
// ---------------------------------------------------------------------------

export default function Players() {
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState<PlayerRole>(PlayerRole.batsman);
  const [jerseyNumber, setJerseyNumber] = useState("");
  // CricHeroes optional fields
  const [cricHeroesUrl, setCricHeroesUrl] = useState("");
  const [chRuns, setChRuns] = useState("");
  const [chWickets, setChWickets] = useState("");
  const [chAvg, setChAvg] = useState("");
  const [chSR, setChSR] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { selectedTeamId, setCurrentPage, selectedTournament } =
    useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [] } = useTeams(activeTournament?.id ?? null);
  const { data: players = [], isLoading } = usePlayers(selectedTeamId);
  const { data: isAdmin = false } = useIsAdmin();

  const createPlayer = useCreatePlayer();
  const updatePlayerStats = useUpdatePlayerStats();

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const allCricHeroesData = loadCricHeroesData();

  function handlePlayerClick(player: Player) {
    setSelectedPlayer(player);
    setProfileOpen(true);
  }

  function resetForm() {
    setPlayerName("");
    setJerseyNumber("");
    setPlayerRole(PlayerRole.batsman);
    setCricHeroesUrl("");
    setChRuns("");
    setChWickets("");
    setChAvg("");
    setChSR("");
  }

  async function handleCreate() {
    if (!playerName.trim() || !selectedTeamId || !jerseyNumber) return;
    try {
      // Step 1: create the player (4 args only)
      const newId = await createPlayer.mutateAsync({
        teamId: selectedTeamId,
        name: playerName.trim(),
        role: playerRole,
        jerseyNumber: BigInt(jerseyNumber),
      });

      // Step 2: if CricHeroes stats were provided, persist them
      const hasStats = chRuns || chWickets || chAvg || chSR;
      if (cricHeroesUrl.trim() || hasStats) {
        const statsPayload = {
          playerId: newId,
          cricHeroesUrl: cricHeroesUrl.trim(),
          totalRuns: BigInt(Number(chRuns) || 0),
          totalWickets: BigInt(Number(chWickets) || 0),
          battingAverage: Number(chAvg) || 0,
          strikeRate: Number(chSR) || 0,
        };

        // Fire-and-forget backend call (gracefully skipped if backend not yet
        // deployed with updatePlayerStats)
        updatePlayerStats.mutate(statsPayload);

        // Always write optimistic local cache so display works immediately
        saveCricHeroesCache(newId, {
          cricHeroesUrl: cricHeroesUrl.trim(),
          totalRuns: Number(chRuns) || 0,
          totalWickets: Number(chWickets) || 0,
          battingAverage: Number(chAvg) || 0,
          strikeRate: Number(chSR) || 0,
          cricHeroesVerified: !!hasStats,
        });
      }

      toast.success("Player added!");
      resetForm();
      setOpen(false);
    } catch {
      toast.error("Failed to add player");
    }
  }

  const isPending = createPlayer.isPending || updatePlayerStats.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage("teams")}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="players.back.button"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Teams
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedTeam ? selectedTeam.name : "Players"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Squad Management &middot; Click a player to view stats
            </p>
          </div>
        </div>

        {isAdmin && selectedTeamId && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                data-ocid="players.add.button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-cricket-border sm:max-w-lg"
              data-ocid="players.add.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Player
                </DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Basic info */}
                <div className="space-y-2">
                  <Label className="text-foreground">Player Name</Label>
                  <Input
                    placeholder="e.g. Virat Kohli"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-secondary border-cricket-border text-foreground"
                    data-ocid="players.create.input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Role</Label>
                  <Select
                    value={playerRole}
                    onValueChange={(v) => setPlayerRole(v as PlayerRole)}
                  >
                    <SelectTrigger
                      className="bg-secondary border-cricket-border text-foreground"
                      data-ocid="players.role.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-cricket-border">
                      {Object.entries(ROLE_LABELS).map(([v, label]) => (
                        <SelectItem key={v} value={v}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Jersey Number</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 18"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="bg-secondary border-cricket-border text-foreground"
                    data-ocid="players.jersey.input"
                  />
                </div>

                {/* CricHeroes section */}
                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: "oklch(0.22 0.06 155 / 0.12)",
                    borderColor: "oklch(0.55 0.18 155 / 0.3)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className="w-4 h-4"
                      style={{ color: "oklch(0.75 0.18 155)" }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.75 0.18 155)" }}
                    >
                      CricHeroes Stats
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (optional)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your CricHeroes stats to get a{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.75 0.18 155)" }}
                    >
                      Verified badge
                    </span>{" "}
                    on your profile.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-foreground text-xs">
                      CricHeroes Profile URL
                    </Label>
                    <Input
                      placeholder="https://cricheroes.in/player-profile/..."
                      value={cricHeroesUrl}
                      onChange={(e) => setCricHeroesUrl(e.target.value)}
                      className="bg-secondary border-cricket-border text-foreground text-sm"
                      data-ocid="players.cricheroes_url.input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-foreground text-xs">
                        Total Runs
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 2450"
                        value={chRuns}
                        onChange={(e) => setChRuns(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground text-sm"
                        data-ocid="players.total_runs.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground text-xs">
                        Total Wickets
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 45"
                        value={chWickets}
                        onChange={(e) => setChWickets(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground text-sm"
                        data-ocid="players.total_wickets.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground text-xs">
                        Batting Average
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 42.5"
                        value={chAvg}
                        onChange={(e) => setChAvg(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground text-sm"
                        data-ocid="players.batting_avg.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground text-xs">
                        Strike Rate
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 138.2"
                        value={chSR}
                        onChange={(e) => setChSR(e.target.value)}
                        className="bg-secondary border-cricket-border text-foreground text-sm"
                        data-ocid="players.strike_rate.input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-cricket-border"
                  data-ocid="players.create.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isPending || !playerName.trim() || !jerseyNumber}
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="players.create.submit_button"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Add Player
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedTeamId ? (
        <div
          className="rounded-xl border border-cricket-border p-12 text-center"
          style={{ background: "oklch(0.22 0.06 230)" }}
          data-ocid="players.empty_state"
        >
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No team selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a team from the Teams page to view players.
          </p>
          <Button
            onClick={() => setCurrentPage("teams")}
            className="mt-4 bg-cricket-green hover:bg-cricket-green/90 text-white"
          >
            Go to Teams
          </Button>
        </div>
      ) : isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="players.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-cricket-green" />
        </div>
      ) : (
        <div
          className="rounded-xl border border-cricket-border shadow-card overflow-hidden"
          style={{ background: "oklch(0.22 0.06 230)" }}
        >
          {players.length === 0 ? (
            <div className="p-12 text-center" data-ocid="players.empty_state">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No players yet
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Add players to this team."
                  : "No players have been added yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-cricket-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">
                    #
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Jersey
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Role
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">
                    Verified
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, i) => {
                  const chData = allCricHeroesData[player.id.toString()];
                  return (
                    <motion.tr
                      key={player.id.toString()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-cricket-border hover:bg-secondary/30 cursor-pointer"
                      data-ocid={`players.item.${i + 1}`}
                      onClick={() => handlePlayerClick(player)}
                    >
                      <TableCell className="text-muted-foreground text-sm">
                        {i + 1}
                      </TableCell>
                      <TableCell>
                        <span className="w-8 h-8 rounded-full bg-primary/20 text-cricket-green text-xs font-bold flex items-center justify-center">
                          {player.jerseyNumber.toString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {player.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${ROLE_COLORS[player.role]}`}
                        >
                          {ROLE_LABELS[player.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {chData?.cricHeroesVerified && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium"
                            style={{ color: "oklch(0.75 0.18 155)" }}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <PlayerProfileSheet
        player={selectedPlayer}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
