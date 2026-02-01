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
 * 今年末を計算
 */
export function calculateEndOfYear(currentTime: Date): Date {
  const endOfYearDate = endOfYear(currentTime);
  // 23:59:59に設定
  return setMilliseconds(setSeconds(setMinutes(setHours(endOfYearDate, 23), 59), 59), 999);
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
  const deathDate = calculateDeathDate(config);
  const nextBirthday = calculateNextBirthday(config.b, currentTime, config.t);
  const endOfYear = calculateEndOfYear(currentTime);
  const endOfMonth = calculateEndOfMonth(currentTime);

  return {
    lifespan: {
      targetDate: deathDate,
      remaining: calculateTimeRemaining(currentTime, deathDate),
    },
    nextBirthday: {
      targetDate: nextBirthday,
      remaining: calculateTimeRemaining(currentTime, nextBirthday),
    },
    endOfYear: {
      targetDate: endOfYear,
      remaining: calculateTimeRemaining(currentTime, endOfYear),
    },
    endOfMonth: {
      targetDate: endOfMonth,
      remaining: calculateTimeRemaining(currentTime, endOfMonth),
    },
  };
}
