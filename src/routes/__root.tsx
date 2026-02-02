import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t, locale, setLocale } = useI18n();

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
          <Button variant="ghost" size="sm" onClick={toggleLocale}>
            {locale === 'ja' ? 'EN' : 'JA'}
          </Button>
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
