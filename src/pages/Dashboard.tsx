import { useAuth } from "@/hooks/use-auth";
import { SolarDashboard } from "@/components/SolarDashboard";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <SolarDashboard />;
}
