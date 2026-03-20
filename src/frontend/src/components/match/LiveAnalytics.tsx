import { ChartContainer } from "@/components/ui/chart";
import { Activity, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BallEntry } from "../../context/AppContext";
import { WagonWheel } from "./WagonWheel";

interface TeamScore {
  runs: string;
  wickets: string;
  overs: string;
}

interface LiveAnalyticsProps {
  matchId: string;
  entries: BallEntry[];
  team1Name: string;
  team2Name: string;
  team1Score: TeamScore;
  team2Score: TeamScore;
}

function parseOvers(overs: string): number {
  const parts = overs.split(".");
  const complete = Number.parseInt(parts[0] ?? "0", 10) || 0;
  const balls = Number.parseInt(parts[1] ?? "0", 10) || 0;
  return complete + balls / 6;
}

function buildOverData(entries: BallEntry[], inningsLabel: string) {
  const overMap: Record<number, number> = {};
  for (const e of entries) {
    const runs = e.runs + (e.extras.type !== "none" ? e.extras.count : 0);
    overMap[e.over] = (overMap[e.over] ?? 0) + runs;
  }
  return Object.entries(overMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([over, runs]) => ({ over: `Ov ${over}`, [inningsLabel]: runs }));
}

function buildCrrData(entries: BallEntry[]) {
  const sorted = [...entries].sort((a, b) =>
    a.over !== b.over ? a.over - b.over : a.ball - b.ball,
  );
  let cumRuns = 0;
  let cumBalls = 0;
  const seenOvers = new Set<number>();
  const data: { over: string; crr: number }[] = [];

  for (const e of sorted) {
    const runs = e.runs + (e.extras.type !== "none" ? e.extras.count : 0);
    cumRuns += runs;
    if (
      e.extras.type === "none" ||
      e.extras.type === "bye" ||
      e.extras.type === "leg-bye"
    ) {
      cumBalls++;
    }
    if (!seenOvers.has(e.over) && e.ball === 6) {
      seenOvers.add(e.over);
      const oversCompleted = cumBalls / 6;
      if (oversCompleted > 0) {
        data.push({
          over: `Ov ${e.over}`,
          crr: Math.round((cumRuns / oversCompleted) * 10) / 10,
        });
      }
    }
  }
  return data;
}

const CARD_BG = "oklch(0.20 0.05 230)";
const SECTION_BG = "oklch(0.22 0.06 230)";
const GREEN = "oklch(0.65 0.18 155)";
const AMBER = "oklch(0.72 0.17 70)";
const SKY = "oklch(0.70 0.15 240)";

const chartConfig = {
  innings1: { label: "1st Inn", color: GREEN },
  innings2: { label: "2nd Inn", color: AMBER },
  crr: { label: "CRR", color: SKY },
};

function StatCard({
  label,
  value,
  sub,
  highlight = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 rounded-xl border p-3 space-y-1"
      style={{
        background: CARD_BG,
        borderColor: highlight
          ? "oklch(0.65 0.18 155 / 0.5)"
          : "oklch(0.30 0.06 240 / 0.6)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className="w-3 h-3"
          style={{ color: highlight ? GREEN : "oklch(0.55 0.08 240)" }}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <div
        className="text-2xl font-black tabular-nums"
        style={{ color: highlight ? GREEN : "oklch(0.90 0.06 240)" }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs space-y-1 shadow-xl"
      style={{
        background: "oklch(0.18 0.05 230 / 0.95)",
        borderColor: "oklch(0.32 0.06 240 / 0.6)",
      }}
    >
      <div className="font-bold text-foreground mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function LiveAnalytics({
  entries,
  team1Name,
  team2Name,
  team1Score,
  team2Score,
}: LiveAnalyticsProps) {
  const { mergedOverData } = useMemo(() => {
    const inn1 = entries.filter((e) => e.over <= 20);
    const inn2 = entries.filter((e) => e.over > 20);

    const d1 = buildOverData(inn1, "innings1");
    const d2 = buildOverData(inn2, "innings2");

    const allLabels = Array.from(
      new Set([...d1.map((x) => x.over), ...d2.map((x) => x.over)]),
    ).sort((a, b) => {
      const na = Number(a.replace("Ov ", ""));
      const nb = Number(b.replace("Ov ", ""));
      return na - nb;
    });

    const merged = allLabels.map((lbl) => ({
      over: lbl,
      innings1: d1.find((x) => x.over === lbl)?.innings1 ?? 0,
      innings2: d2.find((x) => x.over === lbl)?.innings2 ?? 0,
    }));

    const t1Overs = parseOvers(team1Score.overs);
    const t2Overs = parseOvers(team2Score.overs);
    const t1Runs = Number(team1Score.runs) || 0;
    const t2Runs = Number(team2Score.runs) || 0;
    const t1OverCount = Math.ceil(t1Overs) || 20;
    const t2OverCount = Math.ceil(t2Overs) || 20;

    function syntheticOvers(
      totalRuns: number,
      totalOvers: number,
      label: string,
    ) {
      const perOver = totalRuns / totalOvers;
      return Array.from({ length: totalOvers }, (_, i) => ({
        over: `Ov ${i + 1}`,
        [label]: Math.max(
          0,
          Math.round(perOver + Math.sin(i * 1.7) * perOver * 0.35),
        ),
      }));
    }

    const synth1 = syntheticOvers(t1Runs, t1OverCount, "innings1");
    const synth2 = syntheticOvers(t2Runs, t2OverCount, "innings2");

    const synthLabels = Array.from(
      new Set([...synth1.map((x) => x.over), ...synth2.map((x) => x.over)]),
    ).sort(
      (a, b) => Number(a.replace("Ov ", "")) - Number(b.replace("Ov ", "")),
    );

    const synthMerged = synthLabels.map((lbl) => ({
      over: lbl,
      innings1: synth1.find((x) => x.over === lbl)?.innings1 ?? 0,
      innings2: synth2.find((x) => x.over === lbl)?.innings2 ?? 0,
    }));

    const finalMerged = merged.length >= 2 ? merged : synthMerged;

    return { inn1Data: d1, inn2Data: d2, mergedOverData: finalMerged };
  }, [entries, team1Score, team2Score]);

  const crrData = useMemo(() => {
    const real = buildCrrData(entries);
    if (real.length >= 2) return real;

    const t1Runs = Number(team1Score.runs) || 0;
    const t1Overs = parseOvers(team1Score.overs);
    const totalOvers = Math.ceil(t1Overs) || 20;
    let cum = 0;
    return Array.from({ length: totalOvers }, (_, i) => {
      const perOver = t1Runs / totalOvers;
      const thisOver = Math.max(
        0,
        Math.round(perOver + Math.sin(i * 1.7) * perOver * 0.35),
      );
      cum += thisOver;
      const crr = Math.round((cum / (i + 1)) * 10) / 10;
      return { over: `Ov ${i + 1}`, crr };
    });
  }, [entries, team1Score]);

  const t1Runs = Number(team1Score.runs) || 0;
  const t1Overs = parseOvers(team1Score.overs);
  const t2Runs = Number(team2Score.runs) || 0;
  const t2Overs = parseOvers(team2Score.overs);

  const crr = t1Overs > 0 ? (t1Runs / t1Overs).toFixed(2) : "—";

  const totalOvers = 20;
  const oversRemaining = Math.max(0, totalOvers - t2Overs);
  const runsNeeded = Math.max(0, t1Runs - t2Runs + 1);
  const rrr =
    oversRemaining > 0 ? (runsNeeded / oversRemaining).toFixed(2) : "—";

  const crrNum = Number.parseFloat(crr);
  const rrrNum = Number.parseFloat(rrr);
  const isChasing = t2Overs > 0 && t2Runs < t1Runs;

  return (
    <div className="space-y-4" data-ocid="matches.live_analytics.section">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" style={{ color: GREEN }} />
        <span
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: GREEN }}
        >
          Live Analytics
        </span>
      </div>

      {/* Run Rate Stat Cards */}
      <div className="flex gap-3" data-ocid="matches.run_rate.panel">
        <StatCard
          label="CRR"
          value={crr}
          sub={`${team1Name} · ${team1Score.overs} ov`}
          highlight
          icon={TrendingUp}
        />
        {isChasing && (
          <StatCard
            label="RRR"
            value={rrr}
            sub={`${runsNeeded} in ${oversRemaining.toFixed(1)} ov`}
            highlight={rrrNum <= crrNum}
            icon={rrrNum <= crrNum ? TrendingUp : TrendingDown}
          />
        )}
        <StatCard
          label="Required"
          value={String(runsNeeded)}
          sub={isChasing ? `${team2Name} need` : "runs target"}
          icon={Zap}
        />
      </div>

      {/* CRR Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border p-4 space-y-2"
        style={{
          background: SECTION_BG,
          borderColor: "oklch(0.30 0.06 240 / 0.6)",
        }}
        data-ocid="matches.crr_chart.panel"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3 h-3" style={{ color: SKY }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Current Run Rate · Over by Over
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={crrData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="crrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SKY} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={SKY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.30 0.06 240 / 0.3)"
                vertical={false}
              />
              <XAxis
                dataKey="over"
                tick={{ fontSize: 9, fill: "oklch(0.50 0.06 240)" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.floor(crrData.length / 5) - 1)}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(0.50 0.06 240)" }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="crr"
                name="CRR"
                stroke={SKY}
                strokeWidth={2}
                fill="url(#crrGrad)"
                dot={false}
                activeDot={{ r: 4, fill: SKY, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Over-by-Over Runs Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-xl border p-4 space-y-2"
        style={{
          background: SECTION_BG,
          borderColor: "oklch(0.30 0.06 240 / 0.6)",
        }}
        data-ocid="matches.over_chart.panel"
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Activity className="w-3 h-3" style={{ color: AMBER }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Runs Per Over · Both Innings
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mergedOverData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.30 0.06 240 / 0.3)"
                vertical={false}
              />
              <XAxis
                dataKey="over"
                tick={{ fontSize: 9, fill: "oklch(0.50 0.06 240)" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(
                  0,
                  Math.floor(mergedOverData.length / 5) - 1,
                )}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(0.50 0.06 240)" }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "9px", paddingTop: "4px" }}
                formatter={(value) =>
                  value === "innings1" ? team1Name : team2Name
                }
              />
              <Bar
                dataKey="innings1"
                name="innings1"
                fill={GREEN}
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
              <Bar
                dataKey="innings2"
                name="innings2"
                fill={AMBER}
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Wagon Wheel */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm">🏏</span>
        <span
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: AMBER }}
        >
          Shot Map
        </span>
      </div>
      <WagonWheel entries={entries} />
    </div>
  );
}
