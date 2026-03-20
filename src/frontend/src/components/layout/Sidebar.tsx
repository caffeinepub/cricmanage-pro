import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Settings,
  Swords,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Tournament } from "../../backend";
import type { UserRole } from "../../context/AppContext";
import { useAppContext } from "../../context/AppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useTournaments } from "../../hooks/useQueries";

type NavItemId =
  | "dashboard"
  | "tournaments"
  | "teams"
  | "players"
  | "matches"
  | "looking"
  | "suggestions";

const ALL_NAV_ITEMS: {
  id: NavItemId;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "teams", label: "Teams", icon: Users },
  { id: "players", label: "Players", icon: User },
  { id: "matches", label: "Matches", icon: Swords },
  { id: "looking", label: "Looking Board", icon: Compass },
  { id: "suggestions", label: "Suggestions", icon: MessageCircle },
];

const ROLE_NAV: Record<UserRole, NavItemId[]> = {
  organiser: [
    "dashboard",
    "tournaments",
    "teams",
    "players",
    "matches",
    "looking",
    "suggestions",
  ],
  franchisee: [
    "dashboard",
    "teams",
    "players",
    "matches",
    "looking",
    "suggestions",
  ],
  viewer: ["dashboard", "matches", "suggestions"],
  player: ["dashboard", "matches", "players", "suggestions"],
  umpire: ["dashboard", "matches", "suggestions"],
  scorer: ["dashboard", "matches", "players", "suggestions"],
};

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  organiser: {
    label: "Organiser",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  franchisee: {
    label: "Franchisee",
    className: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  },
  viewer: {
    label: "Viewer",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  player: {
    label: "Player",
    className: "bg-violet-500/20 text-violet-400 border-violet-500/40",
  },
  umpire: {
    label: "Umpire",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  scorer: {
    label: "Scorer",
    className: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  },
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const {
    currentPage,
    setCurrentPage,
    selectedTournament,
    setSelectedTournament,
    userRole,
    setUserRole,
  } = useAppContext();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { data: tournaments = [] } = useTournaments();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 10)}...`
    : "";

  const allowedIds: NavItemId[] = userRole
    ? ROLE_NAV[userRole]
    : ["dashboard", "matches", "looking", "suggestions"];
  const navItems = ALL_NAV_ITEMS.filter((item) => allowedIds.includes(item.id));

  function handleLogout() {
    clear();
    setUserRole(null);
  }

  function handleSelectTournament(t: Tournament) {
    setSelectedTournament(t);
  }

  const roleBadge = userRole ? ROLE_BADGE[userRole] : null;

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 flex flex-col z-40 ${mobileOpen ? "flex" : "hidden md:flex"}`}
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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => {
                setCurrentPage(item.id as Parameters<typeof setCurrentPage>[0]);
                onMobileClose?.();
              }}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-cricket-green border border-cricket-green/25 relative overflow-hidden"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
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
        {/* Role Badge */}
        {isLoggedIn && roleBadge && (
          <div
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-2 ${roleBadge.className}`}
            data-ocid="sidebar.role.badge"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {roleBadge.label}
          </div>
        )}

        <button
          type="button"
          disabled
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
          data-ocid="nav.settings.link"
          title="Settings – Coming soon"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        {isLoggedIn ? (
          <div className="mt-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/40 border border-sidebar-border">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/30 text-cricket-green text-xs font-bold">
                  {userRole ? userRole[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate capitalize">
                  {userRole ?? "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {principalShort}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </div>
            <button
              type="button"
              onClick={handleLogout}
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
            Login / Select Role
          </button>
        )}
      </div>
    </aside>
  );
}
