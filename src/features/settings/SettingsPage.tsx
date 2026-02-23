import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { encodeConfig, decodeConfig } from "@/lib/url-codec";
import { validateAge, validateBirthday, validateTimeZone, validateConfig } from "@/lib/validation";
import { TIMEZONES, getBrowserTimeZone } from "@/lib/timezones";
import { loadConfigFromStorage, saveConfigToStorage } from "@/lib/storage";
import { useI18n } from "@/i18n";
import type { ConfigV1 } from "@/types/config";

export interface SettingsPageProps {
  searchParam: string | undefined;
  onSave: (config: ConfigV1, encodedToken: string) => void;
}

export function SettingsPage({ searchParam, onSave }: SettingsPageProps) {
  const { t } = useI18n();

  const getInitialValues = () => {
    // 優先順位1: URLパラメータ
    if (searchParam) {
      const config = decodeConfig(searchParam);
      if (config && validateConfig(config)) {
        saveConfigToStorage(config);
        return {
          age: config.a.toString(),
          birthday: config.b,
          timeZone: config.t,
        };
      }
    }

    // 優先順位2: LocalStorage
    const storedConfig = loadConfigFromStorage();
    if (storedConfig) {
      return {
        age: storedConfig.a.toString(),
        birthday: storedConfig.b,
        timeZone: storedConfig.t,
      };
    }

    // 優先順位3: デフォルト値
    return {
      age: "80",
      birthday: "",
      timeZone: "",
    };
  };

  const initialValues = getInitialValues();
  const [age, setAge] = useState<string>(initialValues.age);
  const [birthday, setBirthday] = useState<string>(initialValues.birthday);
  const [timeZone, setTimeZone] = useState<string>(initialValues.timeZone);
  const [errors, setErrors] = useState<{
    age?: string;
    birthday?: string;
    timeZone?: string;
  }>({});

  useEffect(() => {
    if (!searchParam && !timeZone) {
      const browserTz = getBrowserTimeZone();
      setTimeZone(browserTz);
    }
  }, [searchParam, timeZone]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

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

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const config: ConfigV1 = {
      v: 1,
      a: ageNum,
      b: birthday,
      t: timeZone,
    };

    saveConfigToStorage(config);

    const encoded = encodeConfig(config);
    onSave(config, encoded);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.title}</CardTitle>
          <CardDescription>{t.settings.description}</CardDescription>
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
              {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">{t.settings.birthdayLabel}</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
              {errors.birthday && <p className="text-sm text-destructive">{errors.birthday}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeZone">{t.settings.timeZoneLabel}</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger id="timeZone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeZone && <p className="text-sm text-destructive">{errors.timeZone}</p>}
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
