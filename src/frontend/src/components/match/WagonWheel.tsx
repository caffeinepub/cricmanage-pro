import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { BallEntry } from "../../context/AppContext";

interface WagonWheelProps {
  entries: BallEntry[];
}

const FIELD_R = 120;
const INNER_R = 68; // 30-yard circle
const CENTER_X = 140;
const CENTER_Y = 140;
const SVG_SIZE = 280;

const ZONES = [
  { label: "Cover", angle: -50, r: FIELD_R - 16 },
  { label: "Mid-Off", angle: -20, r: FIELD_R - 12 },
  { label: "Mid-On", angle: 20, r: FIELD_R - 12 },
  { label: "Square Leg", angle: 110, r: FIELD_R - 10 },
  { label: "Fine Leg", angle: 155, r: FIELD_R - 16 },
  { label: "Third Man", angle: -155, r: FIELD_R - 16 },
  { label: "Point", angle: -90, r: FIELD_R - 10 },
  { label: "Deep MWkt", angle: 65, r: FIELD_R - 14 },
];

function deg2rad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Deterministic pseudo-random from a string seed
function seededRand(seed: string, range: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h % range);
}

function shotAngle(entry: BallEntry): number | null {
  if (entry.runs === 0 && entry.extras.type === "none") return null;
  const seed = entry.id;
  const variance = seededRand(seed, 30) - 15;

  if (entry.extras.type === "wide") return -150 + seededRand(`${seed}w`, 30);
  if (entry.runs === 6) return 55 + seededRand(`${seed}6`, 40);
  if (entry.runs === 4) return -45 + variance;
  if (entry.runs >= 3) return -80 + variance;
  if (entry.runs >= 1) return 15 + variance;
  return 0 + variance;
}

function shotColor(entry: BallEntry): string {
  if (entry.runs === 6) return "oklch(0.72 0.17 70)";
  if (entry.runs === 4) return "oklch(0.70 0.15 240)";
  if (entry.runs >= 1) return "oklch(0.65 0.18 155)";
  return "oklch(0.45 0.04 240)";
}

function shotOpacity(entry: BallEntry): number {
  if (entry.runs === 0 && entry.extras.type === "none") return 0.25;
  return 0.85;
}

export function WagonWheel({ entries }: WagonWheelProps) {
  const batsmen = useMemo(() => {
    const names = new Set(entries.map((e) => e.batsman));
    return Array.from(names);
  }, [entries]);

  const [selected, setSelected] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selected === "all") return entries;
    return entries.filter((e) => e.batsman === selected);
  }, [entries, selected]);

  const shots = useMemo(
    () =>
      filtered
        .map((e) => {
          const angle = shotAngle(e);
          if (angle === null) return null;
          const rad = deg2rad(angle - 90); // -90 so 0 = top
          const r =
            e.runs === 6
              ? FIELD_R - 4
              : INNER_R + seededRand(`${e.id}r`, FIELD_R - INNER_R - 8);
          const ex = CENTER_X + Math.cos(rad) * r;
          const ey = CENTER_Y + Math.sin(rad) * r;
          return { e, ex, ey, color: shotColor(e), opacity: shotOpacity(e) };
        })
        .filter(Boolean),
    [filtered],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="rounded-xl border p-4 space-y-3"
      style={{
        background: "oklch(0.22 0.06 230)",
        borderColor: "oklch(0.30 0.06 240 / 0.6)",
      }}
      data-ocid="matches.wagon_wheel.panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🏏</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Wagon Wheel
          </span>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger
            className="h-7 text-xs w-40 border-cricket-border bg-card"
            data-ocid="matches.wagon_wheel.select"
          >
            <SelectValue placeholder="Select batsman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batsmen</SelectItem>
            {batsmen.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SVG Field */}
      <div className="flex justify-center">
        {entries.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-full text-xs text-muted-foreground"
            style={{
              width: SVG_SIZE,
              height: SVG_SIZE,
              background: "oklch(0.18 0.09 150 / 0.3)",
              border: "2px solid oklch(0.30 0.06 240 / 0.4)",
            }}
          >
            No ball data yet
          </div>
        ) : (
          <svg
            role="img"
            aria-label="Wagon wheel shot map showing batting directions"
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            style={{ overflow: "visible" }}
          >
            <title>Wagon wheel shot map</title>
            {/* Outfield */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={FIELD_R}
              fill="oklch(0.20 0.12 150 / 0.5)"
              stroke="oklch(0.45 0.14 150 / 0.4)"
              strokeWidth={1.5}
            />
            {/* 30-yard circle */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={INNER_R}
              fill="oklch(0.25 0.12 150 / 0.35)"
              stroke="oklch(0.55 0.14 150 / 0.5)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            {/* Pitch rectangle */}
            <rect
              x={CENTER_X - 4}
              y={CENTER_Y - 14}
              width={8}
              height={28}
              rx={2}
              fill="oklch(0.50 0.08 70 / 0.6)"
              stroke="oklch(0.65 0.12 70 / 0.5)"
              strokeWidth={0.8}
            />
            {/* Center dot */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={3}
              fill="oklch(0.75 0.10 70 / 0.7)"
            />

            {/* Zone labels */}
            {ZONES.map((z) => {
              const rad = deg2rad(z.angle - 90);
              const lx = CENTER_X + Math.cos(rad) * (z.r + 4);
              const ly = CENTER_Y + Math.sin(rad) * (z.r + 4);
              return (
                <text
                  key={z.label}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7}
                  fill="oklch(0.55 0.06 240)"
                  fontFamily="sans-serif"
                >
                  {z.label}
                </text>
              );
            })}

            {/* Shot lines */}
            {shots.map((s) => {
              if (!s) return null;
              return (
                <g key={s.e.id}>
                  <line
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={s.ex}
                    y2={s.ey}
                    stroke={s.color}
                    strokeWidth={s.e.runs >= 4 ? 2.2 : 1.4}
                    strokeOpacity={s.opacity}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={s.ex}
                    cy={s.ey}
                    r={s.e.runs >= 4 ? 4 : 2.5}
                    fill={s.color}
                    fillOpacity={s.opacity}
                  />
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {[
          { color: "oklch(0.72 0.17 70)", label: "Six" },
          { color: "oklch(0.70 0.15 240)", label: "Four" },
          { color: "oklch(0.65 0.18 155)", label: "1–3 runs" },
          { color: "oklch(0.45 0.04 240)", label: "Dot" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: l.color }}
            />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
