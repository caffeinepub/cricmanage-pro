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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2, Plus, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PlayerRole } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useCreatePlayer,
  useIsAdmin,
  usePlayers,
  useTeams,
  useTournaments,
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

export default function Players() {
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [role, setRole] = useState<PlayerRole>(PlayerRole.batsman);
  const [jerseyNumber, setJerseyNumber] = useState("");
  const { selectedTeamId, setCurrentPage, selectedTournament } =
    useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [] } = useTeams(activeTournament?.id ?? null);
  const { data: players = [], isLoading } = usePlayers(selectedTeamId);
  const { data: isAdmin = false } = useIsAdmin();
  const createPlayer = useCreatePlayer();

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  async function handleCreate() {
    if (!playerName.trim() || !selectedTeamId || !jerseyNumber) return;
    try {
      await createPlayer.mutateAsync({
        teamId: selectedTeamId,
        name: playerName.trim(),
        role,
        jerseyNumber: BigInt(jerseyNumber),
      });
      toast.success("Player added!");
      setPlayerName("");
      setJerseyNumber("");
      setRole(PlayerRole.batsman);
      setOpen(false);
    } catch {
      toast.error("Failed to add player");
    }
  }

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
            <p className="text-sm text-muted-foreground">Squad Management</p>
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
              className="bg-card border-cricket-border sm:max-w-md"
              data-ocid="players.add.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Player
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
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
                    value={role}
                    onValueChange={(v) => setRole(v as PlayerRole)}
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
                  disabled={
                    createPlayer.isPending ||
                    !playerName.trim() ||
                    !jerseyNumber
                  }
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="players.create.submit_button"
                >
                  {createPlayer.isPending ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, i) => (
                  <motion.tr
                    key={player.id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-cricket-border hover:bg-secondary/30"
                    data-ocid={`players.item.${i + 1}`}
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
                      <Badge className={`text-xs ${ROLE_COLORS[player.role]}`}>
                        {ROLE_LABELS[player.role]}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
