import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { decodeConfig } from '@/lib/url-codec';
import { validateConfig } from '@/lib/validation';
import {
  calculateAllTargets,
  getCurrentTimeInTimeZone,
} from '@/lib/time-calculator';
import { useI18n } from '@/i18n';

type ViewSearch = {
  s: string;
};

export const Route = createFileRoute('/view')({
  validateSearch: (search: Record<string, unknown>): ViewSearch => {
    return {
      s: (search.s as string) || '',
    };
  },
  beforeLoad: ({ search }) => {
    const { s } = search;

    if (!s) {
      throw redirect({ to: '/settings' });
    }

    const config = decodeConfig(s);
    if (!config || !validateConfig(config)) {
      throw redirect({ to: '/settings' });
    }

    return { config };
  },
  component: ViewPage,
});

function ViewPage() {
  const { config } = Route.useRouteContext();
  const { t } = useI18n();
  const [currentTime, setCurrentTime] = useState(() =>
    getCurrentTimeInTimeZone(config.t)
  );

  // リアルタイム更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeInTimeZone(config.t));
    }, 1000);

    return () => clearInterval(timer);
  }, [config.t]);

  const targets = calculateAllTargets(config, currentTime);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t.view.title}</h1>
        <p className="text-muted-foreground">
          {t.view.timeZone}: {config.t}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TimeCard
          title={t.view.lifespan.title}
          remaining={targets.lifespan.remaining}
        />
        <TimeCard
          title={t.view.nextBirthday.title}
          remaining={targets.nextBirthday.remaining}
        />
        <TimeCard
          title={t.view.endOfYear.title}
          remaining={targets.endOfYear.remaining}
        />
        <TimeCard
          title={t.view.endOfMonth.title}
          remaining={targets.endOfMonth.remaining}
        />
      </div>

      <div className="text-center">
        <ShareLinkButton />
      </div>
    </div>
  );
}

function TimeCard({
  title,
  remaining,
}: {
  title: string;
  remaining: {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}) {
  const { t } = useI18n();

  // 単位のメタデータ（秒を除く）
  type TimeUnit = {
    key: keyof typeof remaining;
    getValue: (r: typeof remaining) => number;
    getLabel: (units: typeof t.view.units) => string;
  };

  const gridUnits: TimeUnit[] = [
    { key: 'years', getValue: (r) => r.years, getLabel: (u) => u.years },
    { key: 'months', getValue: (r) => r.months, getLabel: (u) => u.months },
    { key: 'weeks', getValue: (r) => r.weeks, getLabel: (u) => u.weeks },
    { key: 'days', getValue: (r) => r.days, getLabel: (u) => u.days },
    { key: 'hours', getValue: (r) => r.hours, getLabel: (u) => u.hours },
    { key: 'minutes', getValue: (r) => r.minutes, getLabel: (u) => u.minutes },
  ];

  // 値がゼロより大きい単位のみをフィルタリング
  const visibleUnits = gridUnits.filter(unit => unit.getValue(remaining) > 0);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {visibleUnits.map((unit) => {
            const value = unit.getValue(remaining);
            const label = unit.getLabel(t.view.units);
            return (
              <div key={unit.key}>
                <span className="font-semibold">{value.toLocaleString()}</span> {label}
              </div>
            );
          })}
        </div>
        <div className="text-2xl font-bold text-center pt-2 border-t">
          {remaining.seconds.toLocaleString()} {t.view.units.seconds}
        </div>
      </div>
    </div>
  );
}

function ShareLinkButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
    >
      {copied ? t.view.copiedButton : t.view.copyButton}
    </button>
  );
}
