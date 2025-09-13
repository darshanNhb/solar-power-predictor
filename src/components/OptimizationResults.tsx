import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Zap, RotateCcw } from "lucide-react";

interface OptimizationResultsProps {
  optimization: {
    optimalTilt: number;
    optimalAzimuth: number;
    maxPowerKw: number;
    currentPowerKw: number;
    improvementPercentage: number;
  };
}

export function OptimizationResults({ optimization }: OptimizationResultsProps) {
  const improvementColor = optimization.improvementPercentage > 0 ? "text-green-600" : "text-red-600";
  const improvementBg = optimization.improvementPercentage > 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Optimization Results
          </CardTitle>
          <CardDescription>
            Recommended panel configuration for maximum power output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Current vs Optimal Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Current Configuration
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Power Output:</span>
                  <Badge variant="outline">
                    {optimization.currentPowerKw.toFixed(2)} kW
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Optimal Configuration
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tilt Angle:</span>
                  <Badge variant="secondary">
                    {optimization.optimalTilt}°
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Azimuth:</span>
                  <Badge variant="secondary">
                    {optimization.optimalAzimuth}°
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Power:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    {optimization.maxPowerKw.toFixed(2)} kW
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Improvement
              </h4>
              <div className={`p-4 rounded-lg border ${improvementBg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`h-5 w-5 ${improvementColor}`} />
                  <span className={`text-2xl font-bold ${improvementColor}`}>
                    {optimization.improvementPercentage > 0 ? '+' : ''}
                    {optimization.improvementPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {optimization.improvementPercentage > 0 ? 'Potential increase' : 'Current is optimal'}
                </div>
              </div>
            </div>
          </div>

          {/* Power Comparison Visual */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Power Output Comparison</span>
              <span className="text-xs text-muted-foreground">
                {optimization.maxPowerKw.toFixed(2)} kW max
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">Current:</span>
                <div className="flex-1">
                  <Progress 
                    value={(optimization.currentPowerKw / optimization.maxPowerKw) * 100} 
                    className="h-2"
                  />
                </div>
                <span className="text-xs w-16 text-right">
                  {optimization.currentPowerKw.toFixed(2)} kW
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">Optimal:</span>
                <div className="flex-1">
                  <Progress 
                    value={100} 
                    className="h-2"
                  />
                </div>
                <span className="text-xs w-16 text-right">
                  {optimization.maxPowerKw.toFixed(2)} kW
                </span>
              </div>
            </div>
          </div>

          {optimization.improvementPercentage > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Optimization Recommendation
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Adjusting your panel tilt to {optimization.optimalTilt}° and azimuth to {optimization.optimalAzimuth}° 
                    could increase your power output by {optimization.improvementPercentage.toFixed(1)}%. 
                    This represents an additional {(optimization.maxPowerKw - optimization.currentPowerKw).toFixed(2)} kW 
                    of potential power generation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
