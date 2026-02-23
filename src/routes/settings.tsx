import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings";
import type { ConfigV1 } from "@/types/config";

type SettingsSearch = {
  s?: string;
};

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    return {
      s: search.s ? (search.s as string) : undefined,
    };
  },
  component: SettingsPageWrapper,
});

function SettingsPageWrapper() {
  const navigate = useNavigate();
  const { s } = Route.useSearch();

  const handleSave = (_config: ConfigV1, encodedToken: string) => {
    navigate({ to: "/view", search: { s: encodedToken } });
  };

  return <SettingsPage searchParam={s} onSave={handleSave} />;
}
