import type { Translation } from './ja';

export const en: Translation = {
  common: {
    appName: 'whilelasts',
    copyright: '© 2026 whilelasts',
  },
  settings: {
    title: 'Settings',
    description: 'Enter your information to calculate the remaining time',
    ageLabel: 'Age at Death',
    birthdayLabel: 'Birthday',
    timeZoneLabel: 'Time Zone',
    saveButton: 'Save and View',
    errors: {
      age: 'Age must be an integer between 1 and 150',
      birthday: 'Please enter a valid birthday (YYYY-MM-DD)',
      timeZone: 'Please select a valid time zone',
    },
  },
  view: {
    title: 'Time Remaining',
    timeZone: 'Time Zone',
    progressFormat: 'Remaining {elapsed} / {total}',
    lifespan: {
      title: 'Until Lifespan',
      description: 'Until {{age}}th birthday',
    },
    nextBirthday: {
      title: 'Until Next Birthday',
      description: 'Until next birthday',
    },
    endOfYear: {
      title: 'Until End of Year',
      description: 'Until the end of this year',
    },
    endOfMonth: {
      title: 'Until End of Month',
      description: 'Until the end of this month',
    },
    settingsButton: 'Change Settings',
    copyButton: 'Copy URL',
    copiedButton: 'Copied!',
    units: {
      years: 'years',
      months: 'months',
      weeks: 'weeks',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
    },
  },
};
