import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/user-context";
import { CycleProvider } from "./context/cycle-context";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <CycleProvider>
        <App />
      </CycleProvider>
    </UserProvider>
  </QueryClientProvider>
);
