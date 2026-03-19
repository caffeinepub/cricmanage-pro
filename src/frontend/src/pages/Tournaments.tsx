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
import {
  Check,
  CheckCircle,
  Loader2,
  Pencil,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TournamentStatus } from "../backend";
import type { Tournament } from "../backend";
import { useAppContext } from "../context/AppContext";
import {
  useCreateTournament,
  useIsAdmin,
  useTournaments,
  useUpdateTournamentName,
  useUpdateTournamentStatus,
} from "../hooks/useQueries";

function TournamentCard({
  tournament,
  isAdmin,
  onSelect,
}: {
  tournament: Tournament;
  isAdmin: boolean;
  onSelect: (t: Tournament) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(tournament.name);
  const updateName = useUpdateTournamentName();
  const updateStatus = useUpdateTournamentStatus();

  async function handleSaveName() {
    if (!editName.trim()) return;
    try {
      await updateName.mutateAsync({
        id: tournament.id,
        name: editName.trim(),
      });
      toast.success("Tournament name updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update name");
    }
  }

  async function handleMarkCompleted() {
    try {
      await updateStatus.mutateAsync({
        id: tournament.id,
        status: TournamentStatus.completed,
      });
      toast.success("Tournament marked as completed");
    } catch {
      toast.error("Failed to update status");
    }
  }

  const isCompleted = tournament.status === TournamentStatus.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cricket-border p-5 shadow-card"
      style={{ background: "oklch(0.22 0.06 230)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.70 0.18 152), oklch(0.55 0.16 170))",
            }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </div>
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="h-8 text-sm bg-secondary border-cricket-border"
                autoFocus
                data-ocid="tournaments.name.input"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={updateName.isPending}
                className="text-cricket-green hover:text-cricket-green/80"
                data-ocid="tournaments.name.save_button"
              >
                {updateName.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditName(tournament.name);
                }}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="tournaments.name.cancel_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {tournament.name}
              </h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-cricket-green flex-shrink-0"
                  data-ocid="tournaments.name.edit_button"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        <Badge
          className={`ml-2 flex-shrink-0 text-xs ${
            isCompleted
              ? "bg-muted/30 text-muted-foreground border-cricket-border"
              : "bg-cricket-green/20 text-cricket-green border-cricket-green/30"
          }`}
        >
          {isCompleted ? "Completed" : "Active"}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground mb-4">
        Created:{" "}
        {new Date(
          Number(tournament.createdAt / BigInt(1_000_000)),
        ).toLocaleDateString()}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onSelect(tournament)}
          className="flex-1 h-8 text-xs bg-cricket-green hover:bg-cricket-green/90 text-white"
          data-ocid="tournaments.select.button"
        >
          View Dashboard
        </Button>
        {isAdmin && !isCompleted && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkCompleted}
            disabled={updateStatus.isPending}
            className="h-8 text-xs border-cricket-border text-muted-foreground hover:text-foreground"
            data-ocid="tournaments.complete.button"
          >
            {updateStatus.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span className="ml-1">Mark Done</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function Tournaments() {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { data: tournaments = [], isLoading } = useTournaments();
  const { data: isAdmin = false } = useIsAdmin();
  const createTournament = useCreateTournament();
  const { setSelectedTournament, setCurrentPage } = useAppContext();

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTournament.mutateAsync(newName.trim());
      toast.success("Tournament created!");
      setNewName("");
      setOpen(false);
    } catch {
      toast.error("Failed to create tournament");
    }
  }

  function handleSelectTournament(t: Tournament) {
    setSelectedTournament(t);
    setCurrentPage("dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tournaments</h1>
          <p className="text-sm text-muted-foreground">
            Manage your cricket tournaments
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                data-ocid="tournaments.add.button"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Tournament
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-cricket-border sm:max-w-md"
              data-ocid="tournaments.add.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create Tournament
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g. Patidar Premier League 2024"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="bg-secondary border-cricket-border text-foreground"
                  data-ocid="tournaments.create.input"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-cricket-border"
                  data-ocid="tournaments.create.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createTournament.isPending || !newName.trim()}
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="tournaments.create.submit_button"
                >
                  {createTournament.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="tournaments.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-cricket-green" />
        </div>
      ) : tournaments.length === 0 ? (
        <div
          className="rounded-xl border border-cricket-border p-12 text-center"
          style={{ background: "oklch(0.22 0.06 230)" }}
          data-ocid="tournaments.empty_state"
        >
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No tournaments yet
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Create your first tournament to get started."
              : "No tournaments have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id.toString()}
              tournament={t}
              isAdmin={isAdmin}
              onSelect={handleSelectTournament}
            />
          ))}
        </div>
      )}
    </div>
  );
}
