import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { Bell, ChevronDown, Search } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login";
import Matches from "../../pages/Matches";
import Players from "../../pages/Players";
import Teams from "../../pages/Teams";
import Tournaments from "../../pages/Tournaments";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { currentPage } = useAppContext();

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
      case "login":
        return <Login />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.15 0.05 242) 0%, oklch(0.19 0.055 228) 100%)",
      }}
    >
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-cricket-border bg-cricket-card/80 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Quick search..."
              data-ocid="header.search_input"
              className="pl-9 pr-4 py-1.5 rounded-full text-sm bg-secondary/60 border border-cricket-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-secondary/60 transition-colors"
              data-ocid="header.notifications.button"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cricket-danger animate-pulse-dot" />
            </button>
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
