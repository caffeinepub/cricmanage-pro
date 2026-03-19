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
import { ChevronRight, Loader2, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Team } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useCreateTeam,
  useIsAdmin,
  usePlayers,
  useTeams,
  useTournaments,
} from "../hooks/useQueries";

const TEAM_COLORS = [
  "oklch(0.55 0.18 25)",
  "oklch(0.60 0.18 260)",
  "oklch(0.65 0.18 80)",
  "oklch(0.55 0.18 320)",
  "oklch(0.70 0.18 152)",
  "oklch(0.60 0.18 200)",
];

function TeamCard({
  team,
  index,
  onViewPlayers,
}: {
  team: Team;
  index: number;
  onViewPlayers: (teamId: bigint) => void;
}) {
  const { data: players = [] } = usePlayers(team.id);
  const abbr = team.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const color = TEAM_COLORS[index % TEAM_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-cricket-border p-5 shadow-card"
      style={{ background: "oklch(0.22 0.06 230)" }}
      data-ocid={`teams.item.${index + 1}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color.replace("0.55", "0.45").replace("0.60", "0.50").replace("0.65", "0.55").replace("0.70", "0.60")})`,
          }}
        >
          {abbr}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {team.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {players.length} players
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-secondary/40 rounded-lg p-2">
          <div className="text-sm font-bold text-foreground">
            {players.length}
          </div>
          <div className="text-xs text-muted-foreground">Squad</div>
        </div>
        <div className="bg-secondary/40 rounded-lg p-2">
          <div className="text-sm font-bold text-cricket-green">5</div>
          <div className="text-xs text-muted-foreground">Wins</div>
        </div>
        <div className="bg-secondary/40 rounded-lg p-2">
          <div className="text-sm font-bold text-cricket-danger">3</div>
          <div className="text-xs text-muted-foreground">Loss</div>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => onViewPlayers(team.id)}
        className="w-full h-8 text-xs bg-cricket-green hover:bg-cricket-green/90 text-white"
        data-ocid={`teams.manage.button.${index + 1}`}
      >
        <Users className="w-3.5 h-3.5 mr-1" />
        Manage Team
        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
      </Button>
    </motion.div>
  );
}

export default function Teams() {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const { selectedTournament, setCurrentPage, setSelectedTeamId } =
    useAppContext();
  const { data: tournaments = [] } = useTournaments();
  const activeTournament = selectedTournament || tournaments[0] || null;
  const { data: teams = [], isLoading } = useTeams(
    activeTournament?.id ?? null,
  );
  const { data: isAdmin = false } = useIsAdmin();
  const createTeam = useCreateTeam();

  async function handleCreate() {
    if (!teamName.trim() || !activeTournament) return;
    try {
      await createTeam.mutateAsync({
        tournamentId: activeTournament.id,
        name: teamName.trim(),
        logoUrl: "",
      });
      toast.success("Team created!");
      setTeamName("");
      setOpen(false);
    } catch {
      toast.error("Failed to create team");
    }
  }

  function handleViewPlayers(teamId: bigint) {
    setSelectedTeamId(teamId);
    setCurrentPage("players");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground">
            {activeTournament ? activeTournament.name : "Select a tournament"}
          </p>
        </div>
        {isAdmin && activeTournament && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                data-ocid="teams.add.button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-cricket-border sm:max-w-md"
              data-ocid="teams.add.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add New Team
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Team Name</Label>
                  <Input
                    placeholder="e.g. Mumbai Indians"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    className="bg-secondary border-cricket-border text-foreground"
                    data-ocid="teams.create.input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-cricket-border"
                  data-ocid="teams.create.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createTeam.isPending || !teamName.trim()}
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="teams.create.submit_button"
                >
                  {createTeam.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Add Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!activeTournament ? (
        <div
          className="rounded-xl border border-cricket-border p-12 text-center"
          style={{ background: "oklch(0.22 0.06 230)" }}
          data-ocid="teams.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No tournament selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Please select a tournament to view its teams.
          </p>
          <Button
            onClick={() => setCurrentPage("tournaments")}
            className="mt-4 bg-cricket-green hover:bg-cricket-green/90 text-white"
          >
            Go to Tournaments
          </Button>
        </div>
      ) : isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="teams.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-cricket-green" />
        </div>
      ) : teams.length === 0 ? (
        <div
          className="rounded-xl border border-cricket-border p-12 text-center"
          style={{ background: "oklch(0.22 0.06 230)" }}
          data-ocid="teams.empty_state"
        >
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No teams yet
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Add your first team to this tournament."
              : "No teams have been added yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team, i) => (
            <TeamCard
              key={team.id.toString()}
              team={team}
              index={i}
              onViewPlayers={handleViewPlayers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
