import { createFileRoute, redirect } from "@tanstack/react-router";
import { decodeConfig } from "@/lib/url-codec";
import { validateConfig } from "@/lib/validation";
import { loadConfigFromStorage, saveConfigToStorage } from "@/lib/storage";
import { ViewPage } from "@/features/view";

type ViewSearch = {
  s?: string;
};

export const Route = createFileRoute("/view")({
  validateSearch: (search: Record<string, unknown>): ViewSearch => {
    return {
      s: search.s ? (search.s as string) : undefined,
    };
  },
  beforeLoad: ({ search }) => {
    const { s } = search;

    // 優先順位1: URLパラメータ
    if (s) {
      const config = decodeConfig(s);
      if (config && validateConfig(config)) {
        // LocalStorageにも保存
        saveConfigToStorage(config);
        return { config };
      }
    }

    // 優先順位2: LocalStorage
    const storedConfig = loadConfigFromStorage();
    if (storedConfig) {
      return { config: storedConfig };
    }

    // どちらもない場合は設定画面へリダイレクト
    throw redirect({ to: "/settings" });
  },
  component: ViewPageWrapper,
});

function ViewPageWrapper() {
  const { config } = Route.useRouteContext();
  const { s } = Route.useSearch();
  return <ViewPage config={config} searchParam={s} />;
}
