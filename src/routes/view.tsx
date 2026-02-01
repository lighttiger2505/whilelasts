import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { decodeConfig } from '@/lib/url-codec';
import { validateConfig } from '@/lib/validation';
import {
  calculateAllTargets,
  getCurrentTimeInTimeZone,
} from '@/lib/time-calculator';
import { useI18n, interpolate } from '@/i18n';

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
          description={interpolate(t.view.lifespan.description, { age: config.a })}
          remaining={targets.lifespan.remaining}
        />
        <TimeCard
          title={t.view.nextBirthday.title}
          description={t.view.nextBirthday.description}
          remaining={targets.nextBirthday.remaining}
        />
        <TimeCard
          title={t.view.endOfYear.title}
          description={t.view.endOfYear.description}
          remaining={targets.endOfYear.remaining}
        />
        <TimeCard
          title={t.view.endOfMonth.title}
          description={t.view.endOfMonth.description}
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
  description,
  remaining,
}: {
  title: string;
  description: string;
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

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">{remaining.years.toLocaleString()}</span> {t.view.units.years}
          </div>
          <div>
            <span className="font-semibold">{remaining.months.toLocaleString()}</span> {t.view.units.months}
          </div>
          <div>
            <span className="font-semibold">{remaining.weeks.toLocaleString()}</span> {t.view.units.weeks}
          </div>
          <div>
            <span className="font-semibold">{remaining.days.toLocaleString()}</span> {t.view.units.days}
          </div>
          <div>
            <span className="font-semibold">{remaining.hours.toLocaleString()}</span> {t.view.units.hours}
          </div>
          <div>
            <span className="font-semibold">{remaining.minutes.toLocaleString()}</span> {t.view.units.minutes}
          </div>
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
