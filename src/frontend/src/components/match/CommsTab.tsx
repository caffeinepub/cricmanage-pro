import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Activity, Eye, Send, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { BallEntry } from "../../context/AppContext";
import { useAppContext } from "../../context/AppContext";
import type { UserRole } from "../../context/AppContext";

const ROLE_LABELS: Record<string, string> = {
  viewer: "Viewer",
  player: "Player",
  umpire: "Umpire",
  franchisee: "Franchisee",
};

function ballBadge(entry: BallEntry) {
  if (entry.wicket) {
    return {
      label: "W",
      style: {
        background: "oklch(0.45 0.18 25 / 0.25)",
        borderColor: "oklch(0.60 0.18 25 / 0.5)",
        color: "oklch(0.80 0.15 25)",
      },
    };
  }
  if (entry.runs === 6) {
    return {
      label: "6",
      style: {
        background: "oklch(0.45 0.18 152 / 0.25)",
        borderColor: "oklch(0.60 0.18 152 / 0.5)",
        color: "oklch(0.80 0.15 152)",
      },
    };
  }
  if (entry.runs === 4) {
    return {
      label: "4",
      style: {
        background: "oklch(0.45 0.18 250 / 0.25)",
        borderColor: "oklch(0.60 0.18 250 / 0.5)",
        color: "oklch(0.78 0.14 250)",
      },
    };
  }
  if (entry.extras.type !== "none" && entry.extras.count > 0) {
    return {
      label: entry.extras.type.toUpperCase()[0] ?? "E",
      style: {
        background: "oklch(0.45 0.15 80 / 0.25)",
        borderColor: "oklch(0.60 0.15 80 / 0.5)",
        color: "oklch(0.78 0.12 80)",
      },
    };
  }
  return {
    label: String(entry.runs),
    style: {
      background: "oklch(0.22 0.04 240 / 0.6)",
      borderColor: "oklch(0.35 0.06 240)",
      color: "oklch(0.65 0.08 240)",
    },
  };
}

function CommentaryEntry({
  entry,
  index,
}: { entry: BallEntry; index: number }) {
  const badge = ballBadge(entry);
  const overBall = `${entry.over}.${entry.ball}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      data-ocid={`comms.item.${index + 1}`}
      className="flex items-start gap-3 py-2.5 px-3 rounded-lg border border-cricket-border/50"
      style={{ background: "oklch(0.20 0.05 230 / 0.5)" }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold"
          style={badge.style}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {overBall}
          </span>
          <span className="text-xs font-semibold text-foreground truncate">
            {entry.batsman}
          </span>
          <span className="text-xs text-muted-foreground">vs</span>
          <span className="text-xs text-muted-foreground truncate">
            {entry.bowler}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {entry.wicket
            ? `OUT! ${entry.wicket.type}${entry.wicket.fielder ? ` (${entry.wicket.fielder})` : ""} — ${entry.runs} run${entry.runs !== 1 ? "s" : ""}`
            : entry.extras.type !== "none" && entry.extras.count > 0
              ? `${entry.runs} run${entry.runs !== 1 ? "s" : ""} + ${entry.extras.count} ${entry.extras.type}`
              : entry.runs === 6
                ? "MAXIMUM! Six over the ropes"
                : entry.runs === 4
                  ? "FOUR! Racing away to the boundary"
                  : entry.runs === 0
                    ? "Dot ball — good delivery"
                    : `${entry.runs} run${entry.runs !== 1 ? "s" : ""} taken`}
        </p>
      </div>
    </motion.div>
  );
}

const DEFAULT_FORM = {
  over: "",
  ball: "",
  batsman: "",
  bowler: "",
  runs: "0",
  extrasType: "none" as BallEntry["extras"]["type"],
  extrasCount: "0",
  wicket: "none",
  fielder: "",
};

export function CommsTab({
  matchId,
  userRole,
}: {
  matchId: string;
  userRole: UserRole | null;
}) {
  const { matchCommentary, addBallEntry } = useAppContext();
  const entries = matchCommentary[matchId] ?? [];
  const canScore = userRole === "scorer" || userRole === "organiser";
  const roleLabel = userRole ? (ROLE_LABELS[userRole] ?? userRole) : "Guest";

  const [form, setForm] = useState({ ...DEFAULT_FORM });

  const setField = useCallback(
    (key: keyof typeof DEFAULT_FORM, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const over = Number.parseInt(form.over, 10);
    const ball = Number.parseInt(form.ball, 10);
    const runs = Number.parseInt(form.runs, 10);
    const extrasCount = Number.parseInt(form.extrasCount, 10) || 0;

    if (
      Number.isNaN(over) ||
      Number.isNaN(ball) ||
      !form.batsman.trim() ||
      !form.bowler.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const entry: BallEntry = {
      id: `ball-${Date.now()}`,
      over,
      ball,
      batsman: form.batsman.trim(),
      bowler: form.bowler.trim(),
      runs,
      extras: { type: form.extrasType, count: extrasCount },
      timestamp: Date.now(),
    };

    if (form.wicket !== "none") {
      entry.wicket = {
        type: form.wicket as NonNullable<BallEntry["wicket"]>["type"],
        fielder: form.fielder.trim() || undefined,
      };
    }

    addBallEntry(matchId, entry);
    setForm({ ...DEFAULT_FORM, batsman: form.batsman, bowler: form.bowler });
    toast.success(
      `Ball logged: ${over}.${ball} — ${runs} run${runs !== 1 ? "s" : ""}`,
    );
  }

  return (
    <div className="space-y-4" data-ocid="comms.panel">
      {/* Commentary Feed */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cricket-green" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ball-by-Ball
          </span>
          <Badge
            variant="outline"
            className="text-xs px-1.5 py-0 border-cricket-border text-muted-foreground ml-auto"
          >
            {entries.length} deliveries
          </Badge>
        </div>

        <ScrollArea className="h-[240px]">
          <div className="space-y-1.5 pr-2">
            {entries.length === 0 && (
              <div
                className="rounded-xl border border-cricket-border p-8 text-center"
                style={{ background: "oklch(0.22 0.06 230)" }}
                data-ocid="comms.empty_state"
              >
                <Zap className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No commentary yet. Log the first ball!
                </p>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {entries.map((entry, i) => (
                <CommentaryEntry key={entry.id} entry={entry} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-cricket-border" />

      {/* Entry form or read-only banner */}
      {canScore ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-3.5 h-3.5 text-cricket-green" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Log Ball
            </span>
          </div>

          {/* Over + Ball */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Over *</Label>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="19"
                value={form.over}
                onChange={(e) => setField("over", e.target.value)}
                className="h-8 text-xs bg-secondary/30 border-cricket-border"
                data-ocid="comms.over.input"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Ball *</Label>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="6"
                value={form.ball}
                onChange={(e) => setField("ball", e.target.value)}
                className="h-8 text-xs bg-secondary/30 border-cricket-border"
                data-ocid="comms.ball.input"
                required
              />
            </div>
          </div>

          {/* Batsman + Bowler */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Batsman *</Label>
              <Input
                placeholder="Virat Kohli"
                value={form.batsman}
                onChange={(e) => setField("batsman", e.target.value)}
                className="h-8 text-xs bg-secondary/30 border-cricket-border"
                data-ocid="comms.batsman.input"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Bowler *</Label>
              <Input
                placeholder="J Bumrah"
                value={form.bowler}
                onChange={(e) => setField("bowler", e.target.value)}
                className="h-8 text-xs bg-secondary/30 border-cricket-border"
                data-ocid="comms.bowler.input"
                required
              />
            </div>
          </div>

          {/* Runs + Extras */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Runs</Label>
              <Select
                value={form.runs}
                onValueChange={(v) => setField("runs", v)}
              >
                <SelectTrigger
                  className="h-8 text-xs bg-secondary/30 border-cricket-border"
                  data-ocid="comms.runs.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                    <SelectItem key={r} value={String(r)} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Extra</Label>
              <Select
                value={form.extrasType}
                onValueChange={(v) => setField("extrasType", v)}
              >
                <SelectTrigger
                  className="h-8 text-xs bg-secondary/30 border-cricket-border"
                  data-ocid="comms.extras.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None
                  </SelectItem>
                  <SelectItem value="wide" className="text-xs">
                    Wide
                  </SelectItem>
                  <SelectItem value="no-ball" className="text-xs">
                    No Ball
                  </SelectItem>
                  <SelectItem value="bye" className="text-xs">
                    Bye
                  </SelectItem>
                  <SelectItem value="leg-bye" className="text-xs">
                    Leg Bye
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Extra Runs
              </Label>
              <Input
                type="number"
                min="0"
                max="5"
                value={form.extrasCount}
                onChange={(e) => setField("extrasCount", e.target.value)}
                className="h-8 text-xs bg-secondary/30 border-cricket-border"
                data-ocid="comms.extras_count.input"
              />
            </div>
          </div>

          {/* Wicket */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Wicket</Label>
              <Select
                value={form.wicket}
                onValueChange={(v) => setField("wicket", v)}
              >
                <SelectTrigger
                  className="h-8 text-xs bg-secondary/30 border-cricket-border"
                  data-ocid="comms.wicket.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None
                  </SelectItem>
                  <SelectItem value="caught" className="text-xs">
                    Caught
                  </SelectItem>
                  <SelectItem value="bowled" className="text-xs">
                    Bowled
                  </SelectItem>
                  <SelectItem value="lbw" className="text-xs">
                    LBW
                  </SelectItem>
                  <SelectItem value="run-out" className="text-xs">
                    Run Out
                  </SelectItem>
                  <SelectItem value="stumped" className="text-xs">
                    Stumped
                  </SelectItem>
                  <SelectItem value="hit-wicket" className="text-xs">
                    Hit Wicket
                  </SelectItem>
                  <SelectItem value="retired" className="text-xs">
                    Retired
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fielder</Label>
              <Input
                placeholder="Fielder name"
                value={form.fielder}
                onChange={(e) => setField("fielder", e.target.value)}
                disabled={form.wicket === "none"}
                className="h-8 text-xs bg-secondary/30 border-cricket-border disabled:opacity-40"
                data-ocid="comms.fielder.input"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            className="w-full h-9 text-xs font-semibold"
            style={{
              background: "oklch(0.55 0.18 152)",
              color: "oklch(0.98 0.01 152)",
            }}
            data-ocid="comms.submit_button"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Log Ball
          </Button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-cricket-border"
          style={{ background: "oklch(0.20 0.04 240 / 0.6)" }}
          data-ocid="comms.readonly.panel"
        >
          <Eye className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            Viewing as{" "}
            <span
              className="font-semibold"
              style={{ color: "oklch(0.75 0.12 240)" }}
            >
              {roleLabel}
            </span>
            {" — commentary is read-only for your role"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
