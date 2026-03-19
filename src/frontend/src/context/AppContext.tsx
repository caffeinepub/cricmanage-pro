import type React from "react";
import { createContext, useContext, useState } from "react";
import type { Tournament } from "../backend";

export type UserRole =
  | "organiser"
  | "franchisee"
  | "viewer"
  | "player"
  | "umpire"
  | "scorer";

const VALID_ROLES: UserRole[] = [
  "organiser",
  "franchisee",
  "viewer",
  "player",
  "umpire",
  "scorer",
];

type Page =
  | "dashboard"
  | "tournaments"
  | "teams"
  | "players"
  | "matches"
  | "looking"
  | "suggestions"
  | "login";

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedTournament: Tournament | null;
  setSelectedTournament: (t: Tournament | null) => void;
  selectedTeamId: bigint | null;
  setSelectedTeamId: (id: bigint | null) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<bigint | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem("cricmanage_role") as UserRole | null;
    if (stored && VALID_ROLES.includes(stored)) {
      return stored;
    }
    return null;
  });

  function setUserRole(role: UserRole | null) {
    setUserRoleState(role);
    if (role) {
      localStorage.setItem("cricmanage_role", role);
    } else {
      localStorage.removeItem("cricmanage_role");
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedTournament,
        setSelectedTournament,
        selectedTeamId,
        setSelectedTeamId,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
