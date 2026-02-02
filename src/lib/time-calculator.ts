import {
  addYears,
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  endOfYear,
  endOfMonth,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { ConfigV1 } from '@/types/config';

export interface TimeRemaining {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ProgressMetrics {
  elapsed: number;    // 経過した期間
  total: number;      // 全体の期間
  unit: 'years' | 'months' | 'days';  // 表示単位
}

/**
 * 誕生日（開始日）を計算
 */
export function calculateBirthday(birthday: string): Date {
  const date = new Date(birthday);
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0);
}

/**
 * 死亡予定日を計算（誕生日 + a歳の誕生日 00:00:00）
 */
export function calculateDeathDate(config: ConfigV1): Date {
  const birthday = new Date(config.b);
  const deathDate = addYears(birthday, config.a);

  // 00:00:00に設定
  return setMilliseconds(setSeconds(setMinutes(setHours(deathDate, 0), 0), 0), 0);
}

/**
 * 指定されたタイムゾーンでの現在時刻を取得
 */
export function getCurrentTimeInTimeZone(timeZone: string): Date {
  return toZonedTime(new Date(), timeZone);
}

/**
 * 2つの日付間の残り時間を計算
 */
export function calculateTimeRemaining(from: Date, to: Date): TimeRemaining {
  return {
    years: differenceInYears(to, from),
    months: differenceInMonths(to, from),
    weeks: differenceInWeeks(to, from),
    days: differenceInDays(to, from),
    hours: differenceInHours(to, from),
    minutes: differenceInMinutes(to, from),
    seconds: differenceInSeconds(to, from),
  };
}

/**
 * 進捗メトリクスを計算（経過期間/全体期間）
 */
export function calculateProgressMetrics(
  startDate: Date,
  currentTime: Date,
  targetDate: Date,
  unit: 'years' | 'months' | 'days'
): ProgressMetrics {
  let elapsed: number;
  let total: number;

  switch (unit) {
    case 'years':
      elapsed = differenceInYears(currentTime, startDate) + 1;
      total = differenceInYears(targetDate, startDate) + 1;
      break;
    case 'months':
      elapsed = differenceInMonths(currentTime, startDate) + 1;
      total = differenceInMonths(targetDate, startDate) + 1;
      break;
    case 'days':
      elapsed = differenceInDays(currentTime, startDate) + 1;
      total = differenceInDays(targetDate, startDate) + 1;
      break;
  }

  return {
    elapsed,
    total,
    unit,
  };
}

/**
 * 次の誕生日を計算
 */
export function calculateNextBirthday(
  birthday: string,
  currentTime: Date,
  _timeZone: string
): Date {
  const birthdayDate = new Date(birthday);
  const currentYear = currentTime.getFullYear();

  // 今年の誕生日
  let nextBirthday = new Date(
    currentYear,
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
    0,
    0,
    0,
    0
  );

  // 今年の誕生日が既に過ぎている場合は来年
  if (nextBirthday <= currentTime) {
    nextBirthday = addYears(nextBirthday, 1);
  }

  return nextBirthday;
}

/**
 * 前回の誕生日を計算（次の誕生日の1年前）
 */
export function calculatePreviousBirthday(
  birthday: string,
  currentTime: Date,
  timeZone: string
): Date {
  const nextBirthday = calculateNextBirthday(birthday, currentTime, timeZone);
  return addYears(nextBirthday, -1);
}

/**
 * 今年の1月1日 00:00:00 を計算
 */
export function calculateStartOfYear(currentTime: Date): Date {
  return setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(
          new Date(currentTime.getFullYear(), 0, 1),
          0
        ),
        0
      ),
      0
    ),
    0
  );
}

/**
 * 今年末を計算
 */
export function calculateEndOfYear(currentTime: Date): Date {
  const endOfYearDate = endOfYear(currentTime);
  // 23:59:59に設定
  return setMilliseconds(setSeconds(setMinutes(setHours(endOfYearDate, 23), 59), 59), 999);
}

/**
 * 今月の1日 00:00:00 を計算
 */
export function calculateStartOfMonth(currentTime: Date): Date {
  return setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(
          new Date(currentTime.getFullYear(), currentTime.getMonth(), 1),
          0
        ),
        0
      ),
      0
    ),
    0
  );
}

/**
 * 今月末を計算
 */
export function calculateEndOfMonth(currentTime: Date): Date {
  const endOfMonthDate = endOfMonth(currentTime);
  // 23:59:59に設定
  return setMilliseconds(setSeconds(setMinutes(setHours(endOfMonthDate, 23), 59), 59), 999);
}

/**
 * 設定に基づいて全ての目標日時を計算
 */
export function calculateAllTargets(config: ConfigV1, currentTime: Date) {
  const birthday = calculateBirthday(config.b);
  const deathDate = calculateDeathDate(config);
  const previousBirthday = calculatePreviousBirthday(config.b, currentTime, config.t);
  const nextBirthday = calculateNextBirthday(config.b, currentTime, config.t);
  const startOfYear = calculateStartOfYear(currentTime);
  const endOfYear = calculateEndOfYear(currentTime);
  const startOfMonth = calculateStartOfMonth(currentTime);
  const endOfMonth = calculateEndOfMonth(currentTime);

  return {
    lifespan: {
      startDate: birthday,
      targetDate: deathDate,
      remaining: calculateTimeRemaining(currentTime, deathDate),
      progressMetrics: calculateProgressMetrics(birthday, currentTime, deathDate, 'years'),
    },
    nextBirthday: {
      startDate: previousBirthday,
      targetDate: nextBirthday,
      remaining: calculateTimeRemaining(currentTime, nextBirthday),
      progressMetrics: calculateProgressMetrics(previousBirthday, currentTime, nextBirthday, 'months'),
    },
    endOfYear: {
      startDate: startOfYear,
      targetDate: endOfYear,
      remaining: calculateTimeRemaining(currentTime, endOfYear),
      progressMetrics: calculateProgressMetrics(startOfYear, currentTime, endOfYear, 'months'),
    },
    endOfMonth: {
      startDate: startOfMonth,
      targetDate: endOfMonth,
      remaining: calculateTimeRemaining(currentTime, endOfMonth),
      progressMetrics: calculateProgressMetrics(startOfMonth, currentTime, endOfMonth, 'days'),
    },
  };
}
