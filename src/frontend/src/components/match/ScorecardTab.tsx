import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "../../context/AppContext";
import type { InningsScorecard } from "../../context/AppContext";
import { PartnershipTracker } from "./PartnershipTracker";

const FALLBACK_INNINGS: InningsScorecard = {
  battingRows: [],
  bowlingRows: [],
  extras: 0,
  total: 0,
  overs: "0.0",
};

function calcSR(runs: number, balls: number) {
  if (balls === 0) return "-";
  return ((runs / balls) * 100).toFixed(1);
}

function calcEcon(runs: number, overs: number) {
  if (overs === 0) return "-";
  return (runs / overs).toFixed(2);
}

function BattingTable({ innings }: { innings: InningsScorecard }) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        Batting
      </h4>
      <div className="rounded-lg border border-cricket-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow
              className="border-cricket-border hover:bg-transparent"
              style={{ background: "oklch(0.18 0.06 240)" }}
            >
              <TableHead className="text-muted-foreground text-xs py-2 pl-3">
                Batsman
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 hidden sm:table-cell">
                How Out
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 hidden sm:table-cell">
                Bowler
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                R
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                B
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                4s
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                6s
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right pr-3">
                SR
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {innings.battingRows.length === 0 && (
              <TableRow className="border-cricket-border">
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground text-xs py-8"
                >
                  No batting data yet
                </TableCell>
              </TableRow>
            )}
            {innings.battingRows.map((row, i) => (
              <TableRow
                key={row.name}
                className="border-cricket-border hover:bg-white/5"
                data-ocid={`scorecard.batting.row.${i + 1}`}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.20 0.05 230 / 0.5)" : "transparent",
                }}
              >
                <TableCell className="text-xs font-medium text-foreground py-2.5 pl-3">
                  {row.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 hidden sm:table-cell">
                  {row.howOut}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 hidden sm:table-cell">
                  {row.bowler}
                </TableCell>
                <TableCell className="text-xs font-bold text-foreground py-2.5 text-right">
                  {row.runs}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.balls}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.fours}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.sixes}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right pr-3">
                  {calcSR(row.runs, row.balls)}
                </TableCell>
              </TableRow>
            ))}
            {innings.battingRows.length > 0 && (
              <>
                <TableRow className="border-cricket-border border-t-cricket-border/60">
                  <TableCell
                    colSpan={3}
                    className="text-xs text-muted-foreground py-2 pl-3"
                  >
                    Extras
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    className="text-xs text-muted-foreground py-2 text-right pr-3"
                  >
                    {innings.extras}
                  </TableCell>
                </TableRow>
                <TableRow
                  className="border-cricket-border"
                  style={{ background: "oklch(0.25 0.07 152 / 0.2)" }}
                >
                  <TableCell
                    colSpan={3}
                    className="text-xs font-bold text-cricket-green py-2.5 pl-3"
                  >
                    Total
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    className="text-xs font-bold text-cricket-green py-2.5 text-right pr-3"
                  >
                    {innings.total} ({innings.overs} Ov)
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BowlingTable({ innings }: { innings: InningsScorecard }) {
  return (
    <div className="space-y-1 mt-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        Bowling
      </h4>
      <div className="rounded-lg border border-cricket-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow
              className="border-cricket-border hover:bg-transparent"
              style={{ background: "oklch(0.18 0.06 240)" }}
            >
              <TableHead className="text-muted-foreground text-xs py-2 pl-3">
                Bowler
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                O
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                M
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                R
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right">
                W
              </TableHead>
              <TableHead className="text-muted-foreground text-xs py-2 text-right pr-3">
                Econ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {innings.bowlingRows.length === 0 && (
              <TableRow className="border-cricket-border">
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground text-xs py-8"
                >
                  No bowling data yet
                </TableCell>
              </TableRow>
            )}
            {innings.bowlingRows.map((row, i) => (
              <TableRow
                key={row.name}
                className="border-cricket-border hover:bg-white/5"
                data-ocid={`scorecard.bowling.row.${i + 1}`}
                style={{
                  background:
                    i % 2 === 0 ? "oklch(0.20 0.05 230 / 0.5)" : "transparent",
                }}
              >
                <TableCell className="text-xs font-medium text-foreground py-2.5 pl-3">
                  {row.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.overs}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.maidens}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right">
                  {row.runs}
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      borderColor:
                        row.wickets > 0
                          ? "oklch(0.60 0.18 25 / 0.5)"
                          : "oklch(0.40 0.05 240)",
                      color:
                        row.wickets > 0
                          ? "oklch(0.75 0.15 25)"
                          : "oklch(0.60 0.08 240)",
                    }}
                  >
                    {row.wickets}W
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-2.5 text-right pr-3">
                  {calcEcon(row.runs, row.overs)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ScorecardTab({
  matchId,
  team1Name,
  team2Name,
}: {
  matchId: string;
  team1Name: string;
  team2Name: string;
}) {
  const { matchScorecards } = useAppContext();
  const scorecard = matchScorecards[matchId];
  const innings1 = scorecard?.innings1 ?? FALLBACK_INNINGS;
  const innings2 = scorecard?.innings2 ?? FALLBACK_INNINGS;

  return (
    <div data-ocid="scorecard.panel">
      <Tabs defaultValue="innings1">
        <TabsList className="grid grid-cols-2 bg-secondary/40 border border-cricket-border rounded-lg mb-4">
          <TabsTrigger
            value="innings1"
            className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="scorecard.innings1.tab"
          >
            1st Innings · {team1Name}
          </TabsTrigger>
          <TabsTrigger
            value="innings2"
            className="text-xs data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
            data-ocid="scorecard.innings2.tab"
          >
            2nd Innings · {team2Name}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="innings1">
          <ScrollArea className="max-h-[520px] pr-1">
            <div className="space-y-2">
              <BattingTable innings={innings1} />
              <BowlingTable innings={innings1} />
              <PartnershipTracker innings={innings1} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="innings2">
          <ScrollArea className="max-h-[520px] pr-1">
            <div className="space-y-2">
              <BattingTable innings={innings2} />
              <BowlingTable innings={innings2} />
              <PartnershipTracker innings={innings2} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
