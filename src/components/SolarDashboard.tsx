import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { 
  Sun, 
  Zap, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud, 
  Gauge,
  TrendingUp,
  Download,
  Loader2,
  RotateCcw,
  Target
} from "lucide-react";
import { OptimizationResults } from "./OptimizationResults";

export function SolarDashboard() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    latitude: 23.02,
    longitude: 72.57,
    tilt: 25,
    azimuth: 180,
    systemCapacityKw: 5,
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const predictSolarPower = useAction(api.solarPrediction.predictSolarPower);
  const optimizePanelConfiguration = useAction(api.solarPrediction.optimizePanelConfiguration);
  const userPredictions = useQuery(api.solarQueries.getUserPredictions, { limit: 20 });
  const userOptimizations = useQuery(api.solarQueries.getUserOptimizations, { limit: 5 });
  const clearUserPredictions = useMutation(api.solarQueries.clearUserPredictions);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const result = await predictSolarPower({
        latitude: formData.latitude,
        longitude: formData.longitude,
        tilt: formData.tilt,
        azimuth: formData.azimuth,
        systemCapacityKw: formData.systemCapacityKw,
        userId: user?._id
      });
      setPrediction(result);
      toast.success("Solar power prediction completed!");
    } catch (error) {
      toast.error("Failed to predict solar power output");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizePanelConfiguration({
        latitude: formData.latitude,
        longitude: formData.longitude,
        currentTilt: formData.tilt,
        currentAzimuth: formData.azimuth,
        systemCapacityKw: formData.systemCapacityKw,
        userId: user?._id
      });
      setOptimization(result);
      toast.success("Panel optimization completed!");
    } catch (error) {
      toast.error("Failed to optimize panel configuration");
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClear = () => {
    setPrediction(null);
    setOptimization(null);
    setFormData({
      latitude: 23.02,
      longitude: 72.57,
      tilt: 25,
      azimuth: 180,
      systemCapacityKw: 5,
    });
    toast.info("Results cleared");
  };

  const handleClearHistory = async () => {
    try {
      await clearUserPredictions({});
      toast.success("Prediction history cleared");
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear history");
    }
  };

  const downloadCSV = () => {
    if (!userPredictions || userPredictions.length === 0) {
      toast.error("No prediction data to download");
      return;
    }

    const csvContent = [
      "Timestamp,Latitude,Longitude,Tilt,Azimuth,System Capacity (kW),Predicted Power (kW),Temperature,Humidity,Cloud Cover,Solar Irradiance",
      ...userPredictions.map(p => 
        `${p.timestamp},${p.latitude},${p.longitude},${p.tilt},${p.azimuth},${p.systemCapacityKw ?? ""},${p.predictedPowerKw.toFixed(2)},${p.weatherData.temperature},${p.weatherData.humidity},${p.weatherData.cloudCover},${p.weatherData.solarIrradiance}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solar_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully!");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Sun className="h-10 w-10 text-yellow-500" />
              Solar Power Predictor
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered solar panel output prediction and optimization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCSV} disabled={!userPredictions?.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleClearHistory} disabled={!userPredictions?.length}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear History
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Panel Configuration
              </CardTitle>
              <CardDescription>
                Enter your location and panel specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.01"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="23.02"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.01"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="72.57"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tilt">Tilt Angle (°)</Label>
                  <Input
                    id="tilt"
                    type="number"
                    min="0"
                    max="90"
                    value={formData.tilt}
                    onChange={(e) => handleInputChange("tilt", e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="azimuth">Azimuth (°)</Label>
                  <Input
                    id="azimuth"
                    type="number"
                    min="0"
                    max="360"
                    value={formData.azimuth}
                    onChange={(e) => handleInputChange("azimuth", e.target.value)}
                    placeholder="180"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">System Capacity (kW)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.systemCapacityKw}
                    onChange={(e) => handleInputChange("systemCapacityKw", e.target.value)}
                    placeholder="e.g. 486.5"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button 
                  onClick={handlePredict} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Predict Power Output
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleOptimize} 
                  disabled={isOptimizing}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Optimize Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {prediction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Power Prediction Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {prediction.predictedPowerKw.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">kW Output</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                          <Thermometer className="h-5 w-5" />
                          {prediction.weatherData.temperature.toFixed(1)}°C
                        </div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                          <Droplets className="h-5 w-5" />
                          {prediction.weatherData.humidity.toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Humidity</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                          <Sun className="h-5 w-5" />
                          {prediction.weatherData.solarIrradiance.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground">W/m² Irradiance</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border">
                        <div className="text-2xl font-bold">
                          {formData.systemCapacityKw} kW
                        </div>
                        <div className="text-sm text-muted-foreground">System Capacity</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-gray-500" />
                        <span>Cloud Cover: {prediction.weatherData.cloudCover}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span>Wind: {prediction.weatherData.windSpeed.toFixed(1)} m/s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-gray-500" />
                        <span>Zenith: {prediction.solarGeometry.zenith.toFixed(1)}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span>Incidence: {prediction.solarGeometry.angleOfIncidence.toFixed(1)}°</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {optimization && (
              <OptimizationResults optimization={optimization} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}