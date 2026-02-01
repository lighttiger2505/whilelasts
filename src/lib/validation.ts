import type { ConfigV1 } from '@/types/config';

/**
 * ConfigV1のバリデーション
 */
export function validateConfig(config: unknown): config is ConfigV1 {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  // バージョンチェック
  if (c.v !== 1) {
    return false;
  }

  // 死ぬ年齢の妥当性チェック（正の整数）
  if (typeof c.a !== 'number' || c.a <= 0 || !Number.isInteger(c.a)) {
    return false;
  }

  // 誕生日形式チェック（YYYY-MM-DD + 有効な日付）
  if (typeof c.b !== 'string') {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(c.b)) {
    return false;
  }

  // 日付の妥当性チェック
  const date = new Date(c.b);
  if (isNaN(date.getTime())) {
    return false;
  }

  // YYYY-MM-DD形式が実際の日付と一致するか確認
  const [year, month, day] = c.b.split('-').map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  // タイムゾーン名の妥当性チェック
  if (typeof c.t !== 'string') {
    return false;
  }

  try {
    // Intl.DateTimeFormatでタイムゾーンの存在を確認
    Intl.DateTimeFormat(undefined, { timeZone: c.t });
  } catch {
    return false;
  }

  return true;
}

/**
 * 年齢が妥当な範囲かチェック（1-150歳）
 */
export function validateAge(age: number): boolean {
  return Number.isInteger(age) && age > 0 && age <= 150;
}

/**
 * YYYY-MM-DD形式の文字列が有効な日付かチェック
 */
export function validateBirthday(birthday: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(birthday)) {
    return false;
  }

  const date = new Date(birthday);
  if (isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = birthday.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * IANA タイムゾーン名が有効かチェック
 */
export function validateTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
