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
import { Calendar, Loader2, MapPin, Plus, Swords } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Match } from "../backend";
import { MatchStatus } from "../backend";
import { useAppContext } from "../context/AppContext";
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
    label: "Scheduled",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  [MatchStatus.completed]: {
    label: "Completed",
    className: "bg-muted/30 text-muted-foreground border-cricket-border",
  },
};

function MatchCard({
  match,
  teams,
  index,
}: {
  match: Match;
  teams: { id: bigint; name: string }[];
  index: number;
}) {
  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);
  const date = new Date(Number(match.scheduledAt / BigInt(1_000_000)));
  const status = STATUS_CONFIG[match.status];
  const isLive = match.status === MatchStatus.live;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-cricket-border p-4 shadow-card"
      style={{ background: "oklch(0.22 0.06 230)" }}
      data-ocid={`matches.item.${index + 1}`}
    >
      <div className="flex items-start justify-between mb-3">
        <Badge
          className={`text-xs ${status.className} ${isLive ? "animate-pulse-dot" : ""}`}
        >
          {isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-cricket-green mr-1 inline-block" />
          )}
          {status.label}
        </Badge>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {date.toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-foreground">
          {team1?.name || "TBD"}
        </div>
        <div className="text-xs font-semibold text-cricket-green px-2 py-0.5 bg-cricket-green/10 rounded">
          VS
        </div>
        <div className="text-sm font-bold text-foreground text-right">
          {team2?.name || "TBD"}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        {match.venue}
      </div>
    </motion.div>
  );
}

export default function Matches() {
  const [open, setOpen] = useState(false);
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [venue, setVenue] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [filter, setFilter] = useState<"all" | MatchStatus>("all");

  const { selectedTournament } = useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [] } = useTeams(activeTournament?.id ?? null);
  const { data: matches = [], isLoading } = useMatches(
    activeTournament?.id ?? null,
  );
  const { data: isAdmin = false } = useIsAdmin();
  const createMatch = useCreateMatch();

  const filteredMatches: Match[] =
    filter === "all" ? matches : matches.filter((m) => m.status === filter);

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

  const filterOptions: Array<"all" | MatchStatus> = [
    "all",
    MatchStatus.live,
    MatchStatus.scheduled,
    MatchStatus.completed,
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matches</h1>
          <p className="text-sm text-muted-foreground">
            {activeTournament ? activeTournament.name : "Select a tournament"}
          </p>
        </div>
        {isAdmin && activeTournament && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                data-ocid="matches.add.button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Match
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2" data-ocid="matches.filter.tab">
        {filterOptions.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-cricket-green text-white"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-cricket-border"
            }`}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f].label}
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
            No matches found
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Schedule your first match." : "No matches available."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match, i) => (
            <MatchCard
              key={match.id.toString()}
              match={match}
              teams={teams}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
