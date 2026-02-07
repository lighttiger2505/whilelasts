import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { loadConfigFromStorage } from '@/lib/storage';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t, locale, setLocale } = useI18n();
  const [timeZone, setTimeZone] = useState<string | null>(null);

  useEffect(() => {
    const config = loadConfigFromStorage();
    if (config) {
      setTimeZone(config.t);
    }
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'ja' ? 'en' : 'ja');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            {t.common.appName}
          </Link>
          <div className="flex items-center gap-4">
            {timeZone && (
              <span className="text-sm">
                {t.view.timeZone}: {timeZone}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={toggleLocale}>
              {locale === 'ja' ? 'EN' : 'JA'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          {t.common.copyright}
        </div>
      </footer>

      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  );
}
