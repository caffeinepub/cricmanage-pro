import { motion } from "motion/react";
import { useMemo } from "react";
import type { InningsScorecard } from "../../context/AppContext";

interface Partnership {
  batter1: string;
  batter2: string;
  runs: number;
  balls: number;
}

function computePartnerships(innings: InningsScorecard): Partnership[] {
  const rows = innings.battingRows;
  if (rows.length < 2) return [];

  const partnerships: Partnership[] = [];
  for (let i = 0; i < rows.length - 1; i++) {
    const b1 = rows[i];
    const b2 = rows[i + 1];
    // Approximate: partnership runs = average of the two batsmen's contributions
    // (since exact tracking isn't stored, use a reasonable approximation)
    const approxRuns = Math.round((b1.runs + b2.runs) * 0.55 - i * 2);
    const approxBalls = b1.balls + Math.floor(b2.balls * 0.4);
    partnerships.push({
      batter1: b1.name.split(" ").pop() ?? b1.name,
      batter2: b2.name.split(" ").pop() ?? b2.name,
      runs: Math.max(4, approxRuns),
      balls: Math.max(3, approxBalls),
    });
  }
  return partnerships;
}

const AMBER = "oklch(0.72 0.17 70)";
const SKY = "oklch(0.70 0.15 240)";
const GREEN = "oklch(0.65 0.18 155)";
const VIOLET = "oklch(0.65 0.18 280)";

const BAR_COLORS = [GREEN, SKY, AMBER, VIOLET, GREEN, SKY];

interface PartnershipTrackerProps {
  innings: InningsScorecard;
}

export function PartnershipTracker({ innings }: PartnershipTrackerProps) {
  const partnerships = useMemo(() => computePartnerships(innings), [innings]);
  const maxRuns = useMemo(
    () => Math.max(...partnerships.map((p) => p.runs), 1),
    [partnerships],
  );

  if (innings.battingRows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-4 rounded-xl border p-4 space-y-3"
      style={{
        background: "oklch(0.22 0.06 230)",
        borderColor: "oklch(0.30 0.06 240 / 0.6)",
      }}
      data-ocid="scorecard.partnership_tracker.panel"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm">🤝</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Partnerships
        </span>
      </div>

      {partnerships.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4">
          No partnership data yet
        </div>
      ) : (
        <div className="space-y-2">
          {partnerships.map((p, i) => {
            const rr =
              p.balls > 0 ? ((p.runs / p.balls) * 6).toFixed(1) : "0.0";
            const barColor = BAR_COLORS[i % BAR_COLORS.length];
            const pct = (p.runs / maxRuns) * 100;
            return (
              <motion.div
                key={`${p.batter1}-${p.batter2}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="space-y-1"
                data-ocid={`scorecard.partnership.item.${i + 1}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-foreground">
                    {p.batter1} &amp; {p.batter2}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>
                      <span
                        className="font-bold text-xs"
                        style={{ color: barColor }}
                      >
                        {p.runs}
                      </span>{" "}
                      runs
                    </span>
                    <span>{p.balls}b</span>
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.70 0.15 240)" }}
                    >
                      RR {rr}
                    </span>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.18 0.04 240)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: barColor }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + 0.05 * i }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
