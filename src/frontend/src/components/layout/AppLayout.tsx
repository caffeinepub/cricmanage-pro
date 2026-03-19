import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { Bell, ChevronDown, LogIn, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login";
import Looking from "../../pages/Looking";
import Matches from "../../pages/Matches";
import Players from "../../pages/Players";
import Suggestions from "../../pages/Suggestions";
import Teams from "../../pages/Teams";
import Tournaments from "../../pages/Tournaments";
import Sidebar from "./Sidebar";

const ROLE_STYLES: Record<string, { label: string; className: string }> = {
  organiser: {
    label: "ORGANISER",
    className:
      "bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
  franchisee: {
    label: "FRANCHISEE",
    className:
      "bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
  viewer: {
    label: "VIEWER",
    className:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
  player: {
    label: "PLAYER",
    className:
      "bg-violet-500/20 text-violet-400 border border-violet-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
  umpire: {
    label: "UMPIRE",
    className:
      "bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
  scorer: {
    label: "SCORER",
    className:
      "bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  },
};

export default function AppLayout() {
  const { currentPage, setCurrentPage, userRole } = useAppContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tournaments":
        return <Tournaments />;
      case "teams":
        return <Teams />;
      case "players":
        return <Players />;
      case "matches":
        return <Matches />;
      case "looking":
        return <Looking />;
      case "suggestions":
        return <Suggestions />;
      case "login":
        return <Login />;
      default:
        return <Dashboard />;
    }
  }

  const roleStyle = userRole ? ROLE_STYLES[userRole] : null;

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.15 0.05 242) 0%, oklch(0.19 0.055 228) 100%)",
      }}
    >
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-cricket-border bg-cricket-card/80 backdrop-blur-sm">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-secondary/60 transition-colors mr-2"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            data-ocid="header.mobile_menu.button"
          >
            {mobileSidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search..."
              data-ocid="header.search_input"
              className="pl-9 pr-4 py-1.5 rounded-full text-sm bg-secondary/60 border border-cricket-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            {isLoggedIn && roleStyle && (
              <span
                className={roleStyle.className}
                data-ocid="header.role.badge"
              >
                {roleStyle.label}
              </span>
            )}

            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-secondary/60 transition-colors"
              data-ocid="header.notifications.button"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cricket-danger animate-pulse-dot" />
            </button>

            {/* Admin Tools — Organiser only */}
            {isLoggedIn && userRole === "organiser" && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  data-ocid="header.admin_tools.button"
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-primary-foreground bg-cricket-green hover:bg-cricket-green/90 transition-colors"
                >
                  Admin Tools
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-cricket-border"
                >
                  <DropdownMenuItem className="cursor-pointer text-sm">
                    Manage Users
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-sm">
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-sm">
                    System Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Login button if not logged in */}
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => setCurrentPage("login")}
                data-ocid="header.login.button"
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-cricket-green hover:bg-cricket-green/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-6">{renderPage()}</main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-cricket-border text-center text-xs text-muted-foreground">
          CricManage Pro &copy; {new Date().getFullYear()} |{" "}
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Privacy Policy
          </span>
          {" | "}
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Terms of Service
          </span>
          {" | "}
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Help Center
          </span>
          {" | "}Built with &#10084;&#65039; using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cricket-green transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
