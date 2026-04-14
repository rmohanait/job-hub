import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, PlusCircle, List, LogOut, Menu, X } from "lucide-react";

const AppHeader = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/add", label: "Add Application", icon: PlusCircle },
    { to: "/applications", label: "My Applications", icon: List },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">JobTracker</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button variant={isActive(to) ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 ml-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t px-4 pb-4 pt-2 flex flex-col gap-1 bg-background">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(to) ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      )}
    </header>
  );
};

export default AppHeader;
