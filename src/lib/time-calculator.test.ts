import { describe, expect, it } from "vitest";
import type { ConfigV1 } from "@/types/config";
import {
  calculateEndOfMonthTarget,
  calculateEndOfYearTarget,
  calculateLifespan,
  calculateNextBirthdayTarget,
} from "./time-calculator";

// すべてのテストで固定の日時を使い、決定的なテストにする
// TZ=Asia/Tokyo に設定済み（vite.config.ts）
// new Date(year, month-1, date, hour, min, sec) はローカル時刻として生成される

describe("calculateLifespan", () => {
  const config: ConfigV1 = { v: 1, a: 80, b: "1990-06-15", t: "Asia/Tokyo" };
  // 2026-02-23 12:00:00 JST
  const currentTime = new Date(2026, 1, 23, 12, 0, 0, 0);

  it("startDate が誕生日 00:00:00 になること", () => {
    const result = calculateLifespan(config, currentTime);
    expect(result.startDate.getFullYear()).toBe(1990);
    expect(result.startDate.getMonth()).toBe(5); // June (0-indexed)
    expect(result.startDate.getDate()).toBe(15);
    expect(result.startDate.getHours()).toBe(0);
    expect(result.startDate.getMinutes()).toBe(0);
    expect(result.startDate.getSeconds()).toBe(0);
  });

  it("targetDate が誕生日 + a歳 00:00:00 になること", () => {
    const result = calculateLifespan(config, currentTime);
    expect(result.targetDate.getFullYear()).toBe(2070);
    expect(result.targetDate.getMonth()).toBe(5); // June (0-indexed)
    expect(result.targetDate.getDate()).toBe(15);
    expect(result.targetDate.getHours()).toBe(0);
    expect(result.targetDate.getMinutes()).toBe(0);
    expect(result.targetDate.getSeconds()).toBe(0);
  });

  it("remaining が currentTime → targetDate の正の差分であること", () => {
    const result = calculateLifespan(config, currentTime);
    expect(result.remaining.years).toBeGreaterThan(0);
    expect(result.remaining.days).toBeGreaterThan(0);
  });

  it("progressMetrics の unit が 'years' であること", () => {
    const result = calculateLifespan(config, currentTime);
    expect(result.progressMetrics.unit).toBe("years");
  });
});

describe("calculateNextBirthdayTarget", () => {
  const birthday = "1990-06-15";
  const timeZone = "Asia/Tokyo";

  describe("誕生日前の場合（2026-02-23: 6/15はまだ来ていない）", () => {
    const currentTime = new Date(2026, 1, 23, 12, 0, 0, 0);

    it("startDate が前回の誕生日であること", () => {
      const result = calculateNextBirthdayTarget(birthday, currentTime, timeZone);
      expect(result.startDate.getFullYear()).toBe(2025);
      expect(result.startDate.getMonth()).toBe(5);
      expect(result.startDate.getDate()).toBe(15);
    });

    it("targetDate が今年の誕生日であること", () => {
      const result = calculateNextBirthdayTarget(birthday, currentTime, timeZone);
      expect(result.targetDate.getFullYear()).toBe(2026);
      expect(result.targetDate.getMonth()).toBe(5);
      expect(result.targetDate.getDate()).toBe(15);
    });

    it("progressMetrics の unit が 'months' であること", () => {
      const result = calculateNextBirthdayTarget(birthday, currentTime, timeZone);
      expect(result.progressMetrics.unit).toBe("months");
    });
  });

  describe("誕生日後の場合（2026-07-01: 6/15は過ぎている）", () => {
    const currentTime = new Date(2026, 6, 1, 12, 0, 0, 0);

    it("startDate が今年の誕生日であること", () => {
      const result = calculateNextBirthdayTarget(birthday, currentTime, timeZone);
      expect(result.startDate.getFullYear()).toBe(2026);
      expect(result.startDate.getMonth()).toBe(5);
      expect(result.startDate.getDate()).toBe(15);
    });

    it("targetDate が来年の誕生日であること", () => {
      const result = calculateNextBirthdayTarget(birthday, currentTime, timeZone);
      expect(result.targetDate.getFullYear()).toBe(2027);
      expect(result.targetDate.getMonth()).toBe(5);
      expect(result.targetDate.getDate()).toBe(15);
    });
  });
});

describe("calculateEndOfYearTarget", () => {
  // 2026-02-23 12:00:00 JST
  const currentTime = new Date(2026, 1, 23, 12, 0, 0, 0);

  it("startDate が1月1日 00:00:00 であること", () => {
    const result = calculateEndOfYearTarget(currentTime);
    expect(result.startDate.getFullYear()).toBe(2026);
    expect(result.startDate.getMonth()).toBe(0); // January (0-indexed)
    expect(result.startDate.getDate()).toBe(1);
    expect(result.startDate.getHours()).toBe(0);
    expect(result.startDate.getMinutes()).toBe(0);
    expect(result.startDate.getSeconds()).toBe(0);
  });

  it("targetDate が翌年1月1日 00:00:00.000 であること", () => {
    const result = calculateEndOfYearTarget(currentTime);
    expect(result.targetDate.getFullYear()).toBe(2027);
    expect(result.targetDate.getMonth()).toBe(0); // January (0-indexed)
    expect(result.targetDate.getDate()).toBe(1);
    expect(result.targetDate.getHours()).toBe(0);
    expect(result.targetDate.getMinutes()).toBe(0);
    expect(result.targetDate.getSeconds()).toBe(0);
    expect(result.targetDate.getMilliseconds()).toBe(0);
  });

  it("progressMetrics の unit が 'months' であること", () => {
    const result = calculateEndOfYearTarget(currentTime);
    expect(result.progressMetrics.unit).toBe("months");
  });
});

describe("calculateEndOfMonthTarget", () => {
  // 2026-02-23 12:00:00 JST（2026年2月は28日まで）
  const currentTime = new Date(2026, 1, 23, 12, 0, 0, 0);

  it("startDate が月初1日 00:00:00 であること", () => {
    const result = calculateEndOfMonthTarget(currentTime);
    expect(result.startDate.getFullYear()).toBe(2026);
    expect(result.startDate.getMonth()).toBe(1); // February (0-indexed)
    expect(result.startDate.getDate()).toBe(1);
    expect(result.startDate.getHours()).toBe(0);
    expect(result.startDate.getMinutes()).toBe(0);
    expect(result.startDate.getSeconds()).toBe(0);
  });

  it("targetDate が翌月1日 00:00:00.000 であること", () => {
    const result = calculateEndOfMonthTarget(currentTime);
    expect(result.targetDate.getFullYear()).toBe(2026);
    expect(result.targetDate.getMonth()).toBe(2); // March (0-indexed)
    expect(result.targetDate.getDate()).toBe(1);
    expect(result.targetDate.getHours()).toBe(0);
    expect(result.targetDate.getMinutes()).toBe(0);
    expect(result.targetDate.getSeconds()).toBe(0);
    expect(result.targetDate.getMilliseconds()).toBe(0);
  });

  it("progressMetrics の unit が 'days' であること", () => {
    const result = calculateEndOfMonthTarget(currentTime);
    expect(result.progressMetrics.unit).toBe("days");
  });
});
