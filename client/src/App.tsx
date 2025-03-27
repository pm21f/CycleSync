import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Dashboard from "@/pages/dashboard";
import CalendarPage from "@/pages/calendar";
import InsightsPage from "@/pages/insights";
import ResourcesPage from "@/pages/resources";
import CommunityPage from "@/pages/community";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      {/* All routes are public now */}
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/community" component={CommunityPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize theme from system preference or saved preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.dataset.mode = savedTheme;
    } else if (systemPrefersDark) {
      document.documentElement.dataset.mode = 'dark';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
