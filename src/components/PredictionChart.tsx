import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp } from "lucide-react";

interface PredictionChartProps {
  predictions: any[];
}

export function PredictionChart({ predictions }: PredictionChartProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Power Output Visualization
          </CardTitle>
          <CardDescription>
            Charts will appear here once you have prediction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = predictions
    .slice(0, 10)
    .reverse()
    .map((pred, index) => ({
      index: index + 1,
      power: pred.predictedPowerKw,
      temperature: pred.weatherData.temperature,
      irradiance: pred.weatherData.solarIrradiance,
      cloudCover: pred.weatherData.cloudCover,
      timestamp: new Date(pred.timestamp).toLocaleTimeString(),
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Power Output Trend
          </CardTitle>
          <CardDescription>
            Recent predictions showing power output over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)} ${name === 'power' ? 'kW' : name === 'temperature' ? '°C' : 'W/m²'}`,
                  name === 'power' ? 'Power Output' : name === 'temperature' ? 'Temperature' : 'Solar Irradiance'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="power" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Factors</CardTitle>
          <CardDescription>
            Weather conditions affecting solar output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} ${name === 'temperature' ? '°C' : name === 'cloudCover' ? '%' : 'W/m²'}`,
                  name === 'temperature' ? 'Temperature' : name === 'cloudCover' ? 'Cloud Cover' : 'Solar Irradiance'
                ]}
              />
              <Bar dataKey="temperature" fill="#3b82f6" />
              <Bar dataKey="cloudCover" fill="#6b7280" />
              <Bar dataKey="irradiance" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prediction vs Time</CardTitle>
          <CardDescription>
            Time series of predicted power based on your history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={predictions
                .slice(0, 30)
                .reverse()
                .map((pred) => ({
                  timestamp: new Date(pred.timestamp).toLocaleTimeString(),
                  power: pred.predictedPowerKw,
                }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} kW`, "Power"]}
              />
              <Area
                type="monotone"
                dataKey="power"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}