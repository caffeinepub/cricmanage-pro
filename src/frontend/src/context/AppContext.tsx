import type React from "react";
import { createContext, useContext, useState } from "react";
import type { Tournament } from "../backend";

type Page =
  | "dashboard"
  | "tournaments"
  | "teams"
  | "players"
  | "matches"
  | "login";

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedTournament: Tournament | null;
  setSelectedTournament: (t: Tournament | null) => void;
  selectedTeamId: bigint | null;
  setSelectedTeamId: (id: bigint | null) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<bigint | null>(null);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedTournament,
        setSelectedTournament,
        selectedTeamId,
        setSelectedTeamId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
