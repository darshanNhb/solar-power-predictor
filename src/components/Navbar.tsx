import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sun } from "lucide-react";
import { useEffect } from "react";

export default function Navbar() {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ensure hash navigation scroll focuses correctly on dashboard
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClass =
    "text-orange-600 underline underline-offset-4";
  const inactiveClass =
    "text-black/70 hover:text-black";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <span className="p-2 rounded-lg bg-orange-500 text-white">
            <Sun className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">SolarPredict AI</span>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard#prediction" className={({ isActive }) => `${linkBase} ${location.pathname === "/dashboard" && location.hash === "#prediction" ? activeClass : inactiveClass}`}>
            Prediction
          </NavLink>
          <NavLink to="/dashboard#history" className={({ isActive }) => `${linkBase} ${location.pathname === "/dashboard" && location.hash === "#history" ? activeClass : inactiveClass}`}>
            History
          </NavLink>
          <NavLink to="/dashboard#visuals" className={({ isActive }) => `${linkBase} ${location.pathname === "/dashboard" && location.hash === "#visuals" ? activeClass : inactiveClass}`}>
            Visuals
          </NavLink>
          <NavLink to="/#about" className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}>
            About
          </NavLink>
          <NavLink to="/#contact" className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}>
            Contact
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <Button
              onClick={() => navigate("/auth")}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Login
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => signOut()}
              disabled={isLoading}
              className="border-black text-black hover:bg-black/5"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
