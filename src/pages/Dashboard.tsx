import { useAuth } from "@/hooks/use-auth";
import { SolarDashboard } from "@/components/SolarDashboard";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const predictions = useQuery(api.solarQueries.getUserPredictions, { limit: 50 });

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

  const latest = predictions && predictions[0];
  const total = predictions?.length ?? 0;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {latest ? `${latest.predictedPowerKw.toFixed(2)} kW` : "—"}
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                {latest ? new Date(latest.timestamp).toLocaleString() : "No data"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{user?.name ?? "User"}</div>
              <div className="text-sm text-muted-foreground">{user?.email ?? "—"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{total}</div>
            </CardContent>
          </Card>
        </div>

        <SolarDashboard />
      </div>
    </div>
  );
}