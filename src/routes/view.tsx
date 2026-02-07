import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { intervalToDuration } from 'date-fns';
import { encodeConfig, decodeConfig } from '@/lib/url-codec';
import { validateConfig } from '@/lib/validation';
import { loadConfigFromStorage, saveConfigToStorage } from '@/lib/storage';
import { getRandomElement } from '@/lib/utils';
import {
  calculateAllTargets,
  getCurrentTimeInTimeZone,
  type ProgressMetrics,
} from '@/lib/time-calculator';
import { useI18n } from '@/i18n';
import { Progress } from '@/components/ui/progress';

type ViewSearch = {
  s?: string;
};

export const Route = createFileRoute('/view')({
  validateSearch: (search: Record<string, unknown>): ViewSearch => {
    return {
      s: search.s ? (search.s as string) : undefined,
    };
  },
  beforeLoad: ({ search }) => {
    const { s } = search;

    // 優先順位1: URLパラメータ
    if (s) {
      const config = decodeConfig(s);
      if (config && validateConfig(config)) {
        // LocalStorageにも保存
        saveConfigToStorage(config);
        return { config };
      }
    }

    // 優先順位2: LocalStorage
    const storedConfig = loadConfigFromStorage();
    if (storedConfig) {
      return { config: storedConfig };
    }

    // どちらもない場合は設定画面へリダイレクト
    throw redirect({ to: '/settings' });
  },
  component: ViewPage,
});

/**
 * 進捗率を計算（0-100%）
 */
function calculateProgress(start: Date, current: Date, target: Date): number {
  const total = target.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();

  if (total <= 0) return 100;

  const percentage = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, percentage));
}

function ViewPage() {
  const { config } = Route.useRouteContext();
  const search = Route.useSearch();
  const { t, locale } = useI18n();
  const [currentTime, setCurrentTime] = useState(() =>
    getCurrentTimeInTimeZone(config.t)
  );

  // ランダムなフレーズを選択（言語が変わった時のみ再選択）
  const phrase = useMemo(() => getRandomElement(t.view.phrases), [t.view.phrases]);

  // 言語に応じてフォントを選択
  const fontFamily = locale === 'ja' ? 'Noto Sans JP, sans-serif' : 'Inter, sans-serif';

  // URLにsパラメータを追加（URL共有機能のため）
  useEffect(() => {
    if (!search.s) {
      const encoded = encodeConfig(config);
      const newUrl = `${window.location.pathname}?s=${encoded}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [search.s, config]);

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
          titleUnits={['years', 'months']}
        />
        <TimeCard
          title={t.view.nextBirthday.title}
          startDate={targets.nextBirthday.startDate}
          targetDate={targets.nextBirthday.targetDate}
          currentTime={currentTime}
          remaining={targets.nextBirthday.remaining}
          progressMetrics={targets.nextBirthday.progressMetrics}
          titleUnits={['months', 'days']}
        />
        <TimeCard
          title={t.view.endOfYear.title}
          startDate={targets.endOfYear.startDate}
          targetDate={targets.endOfYear.targetDate}
          currentTime={currentTime}
          remaining={targets.endOfYear.remaining}
          progressMetrics={targets.endOfYear.progressMetrics}
          titleUnits={['months', 'days']}
        />
        <TimeCard
          title={t.view.endOfMonth.title}
          startDate={targets.endOfMonth.startDate}
          targetDate={targets.endOfMonth.targetDate}
          currentTime={currentTime}
          remaining={targets.endOfMonth.remaining}
          progressMetrics={targets.endOfMonth.progressMetrics}
          titleUnits={['days']}
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

function TimeCard({
  title,
  startDate,
  targetDate,
  currentTime,
  remaining,
  progressMetrics,
  titleUnits,
}: {
  title: string;
  startDate: Date;
  targetDate: Date;
  currentTime: Date;
  remaining: {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  progressMetrics: ProgressMetrics;
  titleUnits?: Array<keyof typeof remaining>;
}) {
  const { t } = useI18n();

  // 進捗率を計算
  const progress = calculateProgress(startDate, currentTime, targetDate);

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

  // タイトル用の階層的な時間を計算
  const duration = intervalToDuration({
    start: currentTime,
    end: targetDate,
  });

  // タイトル用の残り時間を取得（階層的な表示用）
  const getHierarchicalValue = (unitKey: keyof typeof remaining): number => {
    switch (unitKey) {
      case 'years':
        return duration.years ?? 0;
      case 'months':
        return duration.months ?? 0;
      case 'weeks':
        // intervalToDurationはweeksを返さないので、daysから計算
        return Math.floor((duration.days ?? 0) / 7);
      case 'days':
        return duration.days ?? 0;
      case 'hours':
        return duration.hours ?? 0;
      case 'minutes':
        return duration.minutes ?? 0;
      case 'seconds':
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
            {' '}
            <span className="text-primary font-bold">
              {titleUnits.map((unitKey, index) => {
                const unit = gridUnits.find(u => u.key === unitKey);
                if (!unit) return null;
                const value = getHierarchicalValue(unitKey);
                const label = unit.getLabel(t.view.units);
                return (
                  <span key={unitKey}>
                    {value.toLocaleString()}{label}
                    {index < titleUnits.length - 1 && ''}
                  </span>
                );
              }).filter(Boolean)}
            </span>
          </>
        )}
      </h2>

      <div className="mb-4">
        {/* プログレスバー */}
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          {/* 現在値と最大値の表示 */}
          <span>
            {t.view.progressFormat
              .replace('{elapsed}', Math.max(0, progressMetrics.elapsed).toLocaleString())
              .replace('{total}', Math.max(0, progressMetrics.total).toLocaleString())}
            {t.view.units[progressMetrics.unit]}
          </span>
          {/* パーセント表示 */}
          <span>
            {progress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 既存の時間表示 */}
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
