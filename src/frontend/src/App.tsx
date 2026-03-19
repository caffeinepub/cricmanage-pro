import AppLayout from "./components/layout/AppLayout";
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
