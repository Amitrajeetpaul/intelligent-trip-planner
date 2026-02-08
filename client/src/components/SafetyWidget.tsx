import { ShieldCheck, ShieldAlert, CloudRain, ThermometerSun, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  forecast?: string;
  temperature?: string;
  alerts?: string[];
}

interface SafetyWidgetProps {
  score: number;
  warnings?: string[];
  weather?: WeatherData;
}

export function SafetyWidget({ score, warnings = [], weather }: SafetyWidgetProps) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return "bg-emerald-500 shadow-emerald-500/30";
    if (s >= 5) return "bg-amber-500 shadow-amber-500/30";
    return "bg-rose-500 shadow-rose-500/30";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 8) return "Safe to Travel";
    if (s >= 5) return "Exercise Caution";
    return "High Risk";
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all space-y-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />

      {/* Safety Score Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">Safety Score</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time travel advisory</p>
        </div>
        <div className={cn("px-4 py-2 rounded-full text-white font-bold text-lg shadow-lg", getScoreColor(score))}>
          {score.toFixed(1)}/10
        </div>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Safety Status */}
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full animate-pulse", score >= 8 ? "bg-emerald-500" : "bg-amber-500")} />
          <span className="font-medium text-foreground text-lg">{getScoreLabel(score)}</span>
        </div>

        {/* Weather Section */}
        {weather && (weather.forecast || weather.alerts?.length) && (
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-900">Weather & Alerts</span>
            </div>
            {weather.forecast && (
              <p className="text-sm text-blue-800 mb-2 font-medium">{weather.forecast} {weather.temperature ? `• ${weather.temperature}` : ''}</p>
            )}
            {weather.alerts && weather.alerts.length > 0 && (
              <div className="space-y-1">
                {weather.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-rose-600 font-semibold">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safety Warnings */}
        {warnings.length > 0 ? (
          <div className="space-y-2">
            {warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100/50">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100/50">
            <ShieldCheck className="w-4 h-4" />
            <span>No major security alerts reported.</span>
          </div>
        )}
      </div>
    </div>
  );
}
