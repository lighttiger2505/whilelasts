/**
 * 主要なIANAタイムゾーンのリスト
 */
export const TIMEZONES = [
  // アジア
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },

  // ヨーロッパ
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK)' },

  // アメリカ
  { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'America/Sao_Paulo', label: 'America/São Paulo (BRT)' },
  { value: 'America/Mexico_City', label: 'America/Mexico City (CST)' },

  // オセアニア
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZDT/NZST)' },

  // アフリカ
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },

  // UTC
  { value: 'UTC', label: 'UTC' },
] as const;

/**
 * ブラウザのタイムゾーンを取得
 */
export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * タイムゾーン値からラベルを取得
 */
export function getTimeZoneLabel(value: string): string {
  const tz = TIMEZONES.find((tz) => tz.value === value);
  return tz?.label || value;
}
