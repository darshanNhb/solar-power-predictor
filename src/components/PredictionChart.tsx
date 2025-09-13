import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from "recharts";
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
          <CardTitle>Prediction vs Solar Irradiance</CardTitle>
          <CardDescription>
            Relationship between predicted power and incoming solar irradiance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="irradiance"
                name="Irradiance"
                unit=" W/m²"
              />
              <YAxis
                type="number"
                dataKey="power"
                name="Power"
                unit=" kW"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) =>
                  name === "power"
                    ? [`${Number(value).toFixed(2)} kW`, "Power"]
                    : [`${Number(value).toFixed(0)} W/m²`, "Irradiance"]
                }
              />
              <Scatter
                data={[...predictions]
                  .slice(0, 50)
                  .map((p) => ({
                    irradiance: p.weatherData.solarIrradiance,
                    power: p.predictedPowerKw,
                  }))}
                fill="#f59e0b"
              />
            </ScatterChart>
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
          <CardTitle>Prediction vs Temperature</CardTitle>
          <CardDescription>
            Relationship between predicted power and ambient temperature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[...predictions]
                .slice(0, 30)
                .reverse()
                .map((pred) => ({
                  temperature: pred.weatherData.temperature,
                  power: pred.predictedPowerKw,
                }))
                // Sort by temperature for a cleaner line
                .sort((a, b) => a.temperature - b.temperature)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="temperature" label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "Power (kW)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value, name) =>
                  name === "power"
                    ? [`${Number(value).toFixed(2)} kW`, "Power"]
                    : [`${Number(value).toFixed(1)} °C`, "Temperature"]
                }
              />
              <Line
                type="monotone"
                dataKey="power"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1, fill: "#f59e0b" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}