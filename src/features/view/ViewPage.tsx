import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { encodeConfig } from "@/lib/url-codec";
import { getRandomElement } from "@/lib/utils";
import {
  calculateLifespan,
  calculateNextBirthdayTarget,
  calculateEndOfYearTarget,
  calculateEndOfMonthTarget,
  getCurrentTimeInTimeZone,
} from "@/lib/time-calculator";
import { useI18n } from "@/i18n";
import { TimeCard } from "./TimeCard";
import { ShareLinkButton } from "./ShareLinkButton";
import type { ConfigV1 } from "@/types/config";

export interface ViewPageProps {
  config: ConfigV1;
  searchParam: string | undefined;
}

export function ViewPage({ config, searchParam }: ViewPageProps) {
  const { t, locale } = useI18n();
  const [currentTime, setCurrentTime] = useState(() => getCurrentTimeInTimeZone(config.t));

  const phrase = useMemo(() => getRandomElement(t.view.phrases), [t.view.phrases]);

  const fontFamily = locale === "ja" ? "Noto Sans JP, sans-serif" : "Inter, sans-serif";

  useEffect(() => {
    if (!searchParam) {
      const encoded = encodeConfig(config);
      const newUrl = `${window.location.pathname}?s=${encoded}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParam, config]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeInTimeZone(config.t));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.t]);

  const targets = {
    lifespan: calculateLifespan(config, currentTime),
    nextBirthday: calculateNextBirthdayTarget(config.b, currentTime, config.t),
    endOfYear: calculateEndOfYearTarget(currentTime),
    endOfMonth: calculateEndOfMonthTarget(currentTime),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold" style={{ fontFamily }}>
          {phrase}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TimeCard
          title={t.view.lifespan.title}
          startDate={targets.lifespan.startDate}
          targetDate={targets.lifespan.targetDate}
          currentTime={currentTime}
          remaining={targets.lifespan.remaining}
          progressMetrics={targets.lifespan.progressMetrics}
          titleUnits={["years", "months"]}
        />
        <TimeCard
          title={t.view.nextBirthday.title}
          startDate={targets.nextBirthday.startDate}
          targetDate={targets.nextBirthday.targetDate}
          currentTime={currentTime}
          remaining={targets.nextBirthday.remaining}
          progressMetrics={targets.nextBirthday.progressMetrics}
          titleUnits={["months", "days"]}
        />
        <TimeCard
          title={t.view.endOfYear.title}
          startDate={targets.endOfYear.startDate}
          targetDate={targets.endOfYear.targetDate}
          currentTime={currentTime}
          remaining={targets.endOfYear.remaining}
          progressMetrics={targets.endOfYear.progressMetrics}
          titleUnits={["months", "days"]}
        />
        <TimeCard
          title={t.view.endOfMonth.title}
          startDate={targets.endOfMonth.startDate}
          targetDate={targets.endOfMonth.targetDate}
          currentTime={currentTime}
          remaining={targets.endOfMonth.remaining}
          progressMetrics={targets.endOfMonth.progressMetrics}
          titleUnits={["days"]}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Link
          to="/settings"
          search={{ s: encodeConfig(config) }}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
        >
          {t.view.settingsButton}
        </Link>
        <ShareLinkButton />
      </div>
    </div>
  );
}
