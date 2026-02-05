import { ShieldCheck, ShieldAlert, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyWidgetProps {
  score: number;
  warnings?: string[];
}

export function SafetyWidget({ score, warnings = [] }: SafetyWidgetProps) {
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
    <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">Safety Score</h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time travel advisory</p>
        </div>
        <div className={cn("px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg", getScoreColor(score))}>
          {score}/10
        </div>
      </div>

      <div className="mt-6 space-y-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", score >= 8 ? "bg-emerald-500" : "bg-amber-500")} />
          <span className="font-medium text-foreground">{getScoreLabel(score)}</span>
        </div>
        
        {warnings.length > 0 ? (
          <div className="space-y-2 mt-4">
            {warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg mt-4">
            <ShieldCheck className="w-4 h-4" />
            <span>No major alerts reported for this region.</span>
          </div>
        )}
      </div>
    </div>
  );
}
