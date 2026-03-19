import { Button } from "@/components/ui/button";
import {
  Building2,
  ClipboardList,
  Crown,
  Eye,
  Loader2,
  LogIn,
  Scale,
  Shirt,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserRole } from "../context/AppContext";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const ROLES: {
  id: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  glow: string;
  badge: string;
}[] = [
  {
    id: "organiser",
    label: "Organiser",
    icon: Crown,
    description: "Create & manage tournaments, teams, and full scorecards",
    color: "text-amber-400",
    glow: "oklch(0.78 0.17 75)",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  },
  {
    id: "franchisee",
    label: "Franchisee",
    icon: Building2,
    description: "Manage your franchise team, players and performance",
    color: "text-sky-400",
    glow: "oklch(0.72 0.17 220)",
    badge: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  },
  {
    id: "viewer",
    label: "Viewer",
    icon: Eye,
    description: "Watch live scores, standings, and match statistics",
    color: "text-emerald-400",
    glow: "oklch(0.70 0.18 152)",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  },
  {
    id: "player",
    label: "Player",
    icon: Shirt,
    description: "View your match schedule, team roster and personal stats",
    color: "text-violet-400",
    glow: "oklch(0.68 0.22 290)",
    badge: "bg-violet-500/20 text-violet-400 border-violet-500/40",
  },
  {
    id: "umpire",
    label: "Umpire",
    icon: Scale,
    description:
      "Access your assigned matches, update match status and decisions",
    color: "text-orange-400",
    glow: "oklch(0.75 0.18 50)",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  },
  {
    id: "scorer",
    label: "Scorer",
    icon: ClipboardList,
    description: "Enter live scores, record batting and bowling performances",
    color: "text-rose-400",
    glow: "oklch(0.68 0.22 10)",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  },
];

export default function Login() {
  const { login, loginStatus, isLoginError } = useInternetIdentity();
  const { setCurrentPage, setUserRole } = useAppContext();
  const isLoggingIn = loginStatus === "logging-in";
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  async function handleLogin() {
    if (!selectedRole) return;
    try {
      await login();
      setUserRole(selectedRole);
      setCurrentPage("dashboard");
    } catch {
      // isLoginError from useInternetIdentity handles UI feedback
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg"
      >
        <div
          className="rounded-2xl border border-cricket-border p-8 shadow-card"
          style={{ background: "oklch(0.22 0.06 230)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.70 0.18 152), oklch(0.55 0.16 170))",
              }}
            >
              🏏
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              CricManage Pro
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your role to continue
            </p>
          </div>

          {/* Role Cards */}
          <div data-ocid="login.role_selection.panel">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Select your access level
            </p>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 mb-6">
              {ROLES.map((role, i) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole(role.id)}
                    data-ocid={`login.${role.id}.button`}
                    className="w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-200 flex items-center gap-4 group"
                    style={{
                      borderColor: isSelected
                        ? role.glow
                        : "oklch(0.32 0.05 232)",
                      background: isSelected
                        ? `oklch(from ${role.glow} l c h / 0.12)`
                        : "oklch(0.18 0.05 235)",
                      boxShadow: isSelected
                        ? `0 0 18px oklch(from ${role.glow} l c h / 0.22)`
                        : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected
                          ? `oklch(from ${role.glow} l c h / 0.25)`
                          : "oklch(0.26 0.06 232)",
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isSelected
                            ? role.color
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            isSelected ? role.color : "text-foreground"
                          }`}
                        >
                          {role.label}
                        </span>
                        {isSelected && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${role.badge}`}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                        style={{ background: role.glow }}
                      >
                        <svg
                          viewBox="0 0 8 8"
                          className="w-2.5 h-2.5"
                          fill="none"
                          aria-hidden="true"
                        >
                          <title>Selected</title>
                          <path
                            d="M1.5 4L3 5.5L6.5 2"
                            stroke="#fff"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Login Button */}
          <AnimatePresence>
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  data-ocid="login.submit_button"
                  className="w-full bg-cricket-green hover:bg-cricket-green/90 text-white font-semibold py-6 rounded-xl text-base"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 w-5 h-5" />
                      Login as {ROLES.find((r) => r.id === selectedRole)?.label}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedRole && (
            <p className="text-xs text-muted-foreground text-center">
              Select a role above to continue
            </p>
          )}

          {isLoginError && (
            <p
              className="text-destructive text-sm text-center mt-3"
              data-ocid="login.error_state"
            >
              Login failed. Please try again.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
