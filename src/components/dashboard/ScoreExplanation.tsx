import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Smartphone, 
  CreditCard, 
  Activity,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Applicant } from "@/lib/api";
import { calculateScoreBreakdown, getRiskSettings, ScoreBreakdown } from "@/lib/riskCalculator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreExplanationProps {
  applicant: Applicant;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Location & Identity": <MapPin className="w-4 h-4" />,
  "Device Security": <Smartphone className="w-4 h-4" />,
  "Financial History": <CreditCard className="w-4 h-4" />,
  "Behavioral Stability": <Activity className="w-4 h-4" />,
};

const ScoreExplanation = ({ applicant }: ScoreExplanationProps) => {
  const settings = useMemo(() => getRiskSettings(), []);
  const breakdown = useMemo(
    () => calculateScoreBreakdown(applicant, settings),
    [applicant, settings]
  );

  const totalScore = breakdown.reduce((sum, b) => sum + b.score, 0);
  const totalMax = breakdown.reduce((sum, b) => sum + b.maxScore, 0);

  const getImpactIcon = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-3 h-3 text-success" />;
      case "negative":
        return <TrendingDown className="w-3 h-3 text-destructive" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive":
        return "text-success bg-success/10 border-success/20";
      case "negative":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Score Breakdown
          </h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{applicant.apex_score}</span>
            <span className="text-muted-foreground text-sm">/100</span>
          </div>
        </div>
        <Progress 
          value={(totalScore / totalMax) * 100} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Calculated score: {totalScore.toFixed(1)} / {totalMax} points
        </p>
      </div>

      {/* Category Breakdowns */}
      <div className="space-y-3">
        {breakdown.map((category, idx) => (
          <div key={idx} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {categoryIcons[category.category] || <Activity className="w-4 h-4" />}
                </div>
                <span className="font-medium text-foreground">{category.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${
                  category.score >= category.maxScore * 0.7 
                    ? "text-success" 
                    : category.score >= category.maxScore * 0.4 
                      ? "text-warning" 
                      : "text-destructive"
                }`}>
                  {category.score.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-sm">/ {category.maxScore}</span>
              </div>
            </div>

            <Progress 
              value={(category.score / category.maxScore) * 100} 
              className="h-1.5 mb-3"
            />

            {/* Factors */}
            <div className="space-y-2">
              {category.factors.map((factor, fIdx) => (
                <div 
                  key={fIdx} 
                  className={`flex items-center justify-between p-2 rounded-lg border ${getImpactColor(factor.impact)}`}
                >
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <span className="text-sm">{factor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{factor.value}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge 
                          variant={factor.points > 0 ? "default" : factor.points < 0 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {factor.points > 0 ? "+" : ""}{factor.points}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Points impact on score</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-success" />
          <span>Positive Impact</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus className="w-3 h-3" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-destructive" />
          <span>Negative Impact</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreExplanation;
