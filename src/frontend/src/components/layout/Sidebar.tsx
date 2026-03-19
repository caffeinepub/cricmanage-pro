import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Swords,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Tournament } from "../../backend";
import { useAppContext } from "../../context/AppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useTournaments } from "../../hooks/useQueries";

const NAV_ITEMS = [
  { id: "dashboard" as const, label: "My Dashboard", icon: LayoutDashboard },
  { id: "tournaments" as const, label: "Tournaments", icon: Trophy },
  { id: "teams" as const, label: "Teams", icon: Users },
  { id: "players" as const, label: "Players", icon: User },
  { id: "matches" as const, label: "Matches", icon: Swords },
];

export default function Sidebar() {
  const {
    currentPage,
    setCurrentPage,
    selectedTournament,
    setSelectedTournament,
  } = useAppContext();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { data: tournaments = [] } = useTournaments();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 10)}...`
    : "";

  function handleSelectTournament(t: Tournament) {
    setSelectedTournament(t);
  }

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.21 0.055 236) 0%, oklch(0.17 0.05 240) 100%)",
        borderRight: "1px solid oklch(0.28 0.05 232)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.70 0.18 152), oklch(0.55 0.16 170))",
          }}
        >
          🏏
        </div>
        <div>
          <div className="text-foreground font-bold text-sm leading-tight">
            CricManage
          </div>
          <div className="text-cricket-green text-xs font-semibold">Pro</div>
        </div>
      </div>

      {/* Tournament Selector */}
      {tournaments.length > 0 && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-foreground bg-secondary/60 border border-sidebar-border hover:bg-secondary transition-colors"
              data-ocid="sidebar.select"
            >
              <span className="truncate">
                {selectedTournament
                  ? selectedTournament.name
                  : "Select Tournament"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-sidebar-border">
              {tournaments.map((t) => (
                <DropdownMenuItem
                  key={t.id.toString()}
                  onClick={() => handleSelectTournament(t)}
                  className="cursor-pointer text-xs"
                >
                  {t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ x: 2 }}
              onClick={() => setCurrentPage(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/20 text-cricket-green border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-cricket-green" : ""}`}
              />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <button
          type="button"
          onClick={() => setCurrentPage("dashboard")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          data-ocid="nav.settings.link"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        {isLoggedIn ? (
          <div className="mt-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/40 border border-sidebar-border">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/30 text-cricket-green text-xs font-bold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">
                  Admin
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {principalShort}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </div>
            <button
              type="button"
              onClick={clear}
              data-ocid="nav.logout.button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentPage("login")}
            data-ocid="nav.login.link"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cricket-green hover:bg-primary/10 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login / Admin
          </button>
        )}
      </div>
    </aside>
  );
}
