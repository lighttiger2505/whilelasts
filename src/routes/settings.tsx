import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { encodeConfig } from '@/lib/url-codec';
import { validateAge, validateBirthday, validateTimeZone } from '@/lib/validation';
import { TIMEZONES, getBrowserTimeZone } from '@/lib/timezones';
import { useI18n } from '@/i18n';
import type { ConfigV1 } from '@/types/config';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [age, setAge] = useState<string>('80');
  const [birthday, setBirthday] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');
  const [errors, setErrors] = useState<{
    age?: string;
    birthday?: string;
    timeZone?: string;
  }>({});

  // 初期化：ブラウザのタイムゾーンを設定
  useEffect(() => {
    const browserTz = getBrowserTimeZone();
    setTimeZone(browserTz);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // バリデーション
    const ageNum = parseInt(age, 10);
    if (!validateAge(ageNum)) {
      newErrors.age = t.settings.errors.age;
    }

    if (!validateBirthday(birthday)) {
      newErrors.birthday = t.settings.errors.birthday;
    }

    if (!validateTimeZone(timeZone)) {
      newErrors.timeZone = t.settings.errors.timeZone;
    }

    setErrors(newErrors);

    // エラーがあれば送信しない
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // ConfigV1オブジェクト生成
    const config: ConfigV1 = {
      v: 1,
      a: ageNum,
      b: birthday,
      t: timeZone,
    };

    // Base64URLエンコード
    const encoded = encodeConfig(config);

    // /view?s=<token> へナビゲート
    navigate({ to: '/view', search: { s: encoded } });
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.title}</CardTitle>
          <CardDescription>
            {t.settings.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t.settings.ageLabel}</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="80"
                min="1"
                max="150"
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">{t.settings.birthdayLabel}</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              {errors.birthday && (
                <p className="text-sm text-destructive">{errors.birthday}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeZone">{t.settings.timeZoneLabel}</Label>
              <Select
                id="timeZone"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
              {errors.timeZone && (
                <p className="text-sm text-destructive">{errors.timeZone}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              {t.settings.saveButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
