import { intervalToDuration } from "date-fns";
import { useI18n } from "@/i18n";
import { Progress } from "@/components/ui/progress";
import { calculateProgress, type TimeRemaining, type ProgressMetrics } from "@/lib/time-calculator";

export interface TimeCardProps {
  title: string;
  startDate: Date;
  targetDate: Date;
  currentTime: Date;
  remaining: TimeRemaining;
  progressMetrics: ProgressMetrics;
  titleUnits?: Array<keyof TimeRemaining>;
}

export function TimeCard({
  title,
  startDate,
  targetDate,
  currentTime,
  remaining,
  progressMetrics,
  titleUnits,
}: TimeCardProps) {
  const { t } = useI18n();

  const progress = calculateProgress(startDate, currentTime, targetDate);

  type TimeUnit = {
    key: keyof typeof remaining;
    getValue: (r: typeof remaining) => number;
    getLabel: (units: typeof t.view.units) => string;
  };

  const gridUnits: TimeUnit[] = [
    { key: "years", getValue: (r) => r.years, getLabel: (u) => u.years },
    { key: "months", getValue: (r) => r.months, getLabel: (u) => u.months },
    { key: "weeks", getValue: (r) => r.weeks, getLabel: (u) => u.weeks },
    { key: "days", getValue: (r) => r.days, getLabel: (u) => u.days },
    { key: "hours", getValue: (r) => r.hours, getLabel: (u) => u.hours },
    { key: "minutes", getValue: (r) => r.minutes, getLabel: (u) => u.minutes },
  ];

  const duration = intervalToDuration({
    start: currentTime,
    end: targetDate,
  });

  const getHierarchicalValue = (unitKey: keyof typeof remaining): number => {
    switch (unitKey) {
      case "years":
        return duration.years ?? 0;
      case "months":
        return duration.months ?? 0;
      case "weeks":
        return Math.floor((duration.days ?? 0) / 7);
      case "days":
        return duration.days ?? 0;
      case "hours":
        return duration.hours ?? 0;
      case "minutes":
        return duration.minutes ?? 0;
      case "seconds":
        return duration.seconds ?? 0;
      default:
        return 0;
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-3">
        {title}
        {titleUnits && titleUnits.length > 0 && (
          <>
            {" "}
            <span className="text-primary font-bold">
              {titleUnits
                .map((unitKey, index) => {
                  const unit = gridUnits.find((u) => u.key === unitKey);
                  if (!unit) return null;
                  const value = getHierarchicalValue(unitKey);
                  const label = unit.getLabel(t.view.units);
                  return (
                    <span key={unitKey}>
                      {value.toLocaleString()}
                      {label}
                      {index < titleUnits.length - 1 && ""}
                    </span>
                  );
                })
                .filter(Boolean)}
            </span>
          </>
        )}
      </h2>

      <div className="mb-4">
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <span>
            {t.view.progressFormat
              .replace("{elapsed}", Math.max(0, progressMetrics.elapsed).toLocaleString())
              .replace("{total}", Math.max(0, progressMetrics.total).toLocaleString())}
            {t.view.units[progressMetrics.unit]}
          </span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
