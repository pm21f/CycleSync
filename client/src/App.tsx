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
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Protected Routes */}
      <Route path="/" component={isAuthenticated ? Dashboard : LoginPage} />
      <Route path="/calendar" component={isAuthenticated ? CalendarPage : LoginPage} />
      <Route path="/insights" component={isAuthenticated ? InsightsPage : LoginPage} />
      <Route path="/resources" component={isAuthenticated ? ResourcesPage : LoginPage} />
      <Route path="/community" component={isAuthenticated ? CommunityPage : LoginPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
