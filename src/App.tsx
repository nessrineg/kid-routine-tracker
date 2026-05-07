import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/lib/i18n";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ChildHome from "@/pages/ChildHome";
import ChildRoutine from "@/pages/ChildRoutine";
import EditChild from "@/pages/EditChild";
import WeeklyView from "@/pages/WeeklyView";
import GamesPage from "@/pages/GamesPage";
import AdhkarPage from "@/pages/AdhkarPage";
import StoriesPage from "@/pages/StoriesPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Guarded = ({ Page }: { Page: React.ComponentType }) => (
  <SubscriptionGuard><Page /></SubscriptionGuard>
);

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription/cancel" component={SubscriptionCancel} />

      <Route path="/" component={() => <Guarded Page={Dashboard} />} />
      <Route path="/child/:id" component={() => <Guarded Page={ChildHome} />} />
      <Route path="/child/:id/routine" component={() => <Guarded Page={ChildRoutine} />} />
      <Route path="/child/:id/edit" component={() => <Guarded Page={EditChild} />} />
      <Route path="/child/:id/weekly" component={() => <Guarded Page={WeeklyView} />} />
      <Route path="/child/:id/games" component={() => <Guarded Page={GamesPage} />} />
      <Route path="/child/:id/adhkar" component={() => <Guarded Page={AdhkarPage} />} />
      <Route path="/child/:id/stories" component={() => <Guarded Page={StoriesPage} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
