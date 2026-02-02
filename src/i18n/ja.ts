export interface Translation {
  common: {
    appName: string;
    copyright: string;
  };
  settings: {
    title: string;
    description: string;
    ageLabel: string;
    birthdayLabel: string;
    timeZoneLabel: string;
    saveButton: string;
    errors: {
      age: string;
      birthday: string;
      timeZone: string;
    };
  };
  view: {
    title: string;
    timeZone: string;
    progressFormat: string;
    lifespan: {
      title: string;
      description: string;
    };
    nextBirthday: {
      title: string;
      description: string;
    };
    endOfYear: {
      title: string;
      description: string;
    };
    endOfMonth: {
      title: string;
      description: string;
    };
    settingsButton: string;
    copyButton: string;
    copiedButton: string;
    units: {
      years: string;
      months: string;
      weeks: string;
      days: string;
      hours: string;
      minutes: string;
      seconds: string;
    };
  };
}

export const ja: Translation = {
  common: {
    appName: 'whilelasts',
    copyright: '© 2026 whilelasts',
  },
  settings: {
    title: '設定',
    description: 'あなたの情報を入力して、残り時間を計算しましょう',
    ageLabel: '死ぬ年齢',
    birthdayLabel: '誕生日',
    timeZoneLabel: 'タイムゾーン',
    saveButton: '保存して表示',
    errors: {
      age: '年齢は1-150の整数で入力してください',
      birthday: '有効な誕生日を入力してください（YYYY-MM-DD）',
      timeZone: '有効なタイムゾーンを選択してください',
    },
  },
  view: {
    title: '残り時間',
    timeZone: 'タイムゾーン',
    progressFormat: '残り {elapsed} / {total}',
    lifespan: {
      title: '寿命まで',
      description: '{{age}}歳の誕生日まで',
    },
    nextBirthday: {
      title: '次の誕生日まで',
      description: '次の誕生日まで',
    },
    endOfYear: {
      title: '今年末まで',
      description: '今年の終わりまで',
    },
    endOfMonth: {
      title: '今月末まで',
      description: '今月の終わりまで',
    },
    settingsButton: '設定を変更',
    copyButton: 'URLをコピー',
    copiedButton: 'コピーしました！',
    units: {
      years: '年',
      months: 'ヶ月',
      weeks: '週',
      days: '日',
      hours: '時間',
      minutes: '分',
      seconds: '秒',
    },
  },
};
