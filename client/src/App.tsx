import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tailors from "@/pages/tailors";
import TailorProfile from "@/pages/tailor-profile";
import Booking from "@/pages/booking";
import Orders from "@/pages/orders";
import Learning from "@/pages/learning";
import Admin from "@/pages/admin";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoading && isAuthenticated && <Header />}
      
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/tailors" component={Tailors} />
              <Route path="/tailors/:id" component={TailorProfile} />
              <Route path="/booking" component={Booking} />
              <Route path="/booking/:tailorId" component={Booking} />
              <Route path="/orders" component={Orders} />
              <Route path="/learning" component={Learning} />
              <Route path="/admin" component={Admin} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isLoading && isAuthenticated && (
        <>
          <Footer />
          <MobileNav />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
