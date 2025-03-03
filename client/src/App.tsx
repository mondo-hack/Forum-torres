import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/shared/Navbar";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Forum from "@/pages/forum";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import { getUser } from "@/lib/storage";
import { useEffect } from "react";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const user = getUser();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const user = getUser();
  if (!user?.isAdmin) {
    window.location.href = '/';
    return null;
  }
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const user = getUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation('/chat');
    }
  }, [user, setLocation]);

  if (user) return null;
  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={() => <PublicRoute component={Home} />} />
        <Route path="/chat" component={() => <PrivateRoute component={Chat} />} />
        <Route path="/forum" component={() => <PrivateRoute component={Forum} />} />
        <Route path="/profile" component={() => <PrivateRoute component={Profile} />} />
        <Route path="/admin" component={() => <AdminRoute component={Admin} />} />
        <Route path="/login" component={() => <PublicRoute component={Login} />} />
        <Route path="/register" component={() => <PublicRoute component={Register} />} />
        <Route path="/forgot-password" component={() => <PublicRoute component={ForgotPassword} />} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
