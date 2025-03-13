import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import ScrapersPage from "@/pages/scrapers";
import CollectionsPage from "@/pages/collections";
import HistoryPage from "@/pages/history";
import ScheduledPage from "@/pages/scheduled";
import SettingsPage from "@/pages/settings";
import JobPage from "@/pages/job";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={DashboardPage} />
      <Route path="/scrapers" component={ScrapersPage} />
      <Route path="/collections" component={CollectionsPage} />
      <Route path="/scheduled" component={ScheduledPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/jobs/:id" component={JobPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
