# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**whilelasts** は、人生の残り時間をさまざまな単位で可視化するフロントエンドのみのWebアプリケーションです。

- DBなし・APIサーバーなし
- 設定情報は URLのクエリパラメータ（`s`パラメータ）と LocalStorage の二重永続化で保持
- URLを共有することで設定を復元可能（URLパラメータが優先）

## 開発コマンド

```bash
# 開発サーバーの起動
pnpm dev

# プロダクションビルド
pnpm build

# ビルドしたアプリのプレビュー
pnpm preview

# コードのフォーマット（oxfmt）
pnpm fmt

# フォーマットチェック（CI向け）
pnpm fmt:check

# コードのlintチェック（oxlint）
pnpm lint

# lintエラーの自動修正
pnpm lint:fix

# TypeScriptの型チェック
pnpm type-check

# 一括チェック（TSRルート生成 + フォーマット + lint + 型チェック）
pnpm check

# Cloudflare Pagesへデプロイ（ビルド含む）
pnpm deploy
```

## コアアーキテクチャ

### 設定データフロー

1. **エンコード**: `src/lib/url-codec.ts`
   - `ConfigV1`型のオブジェクトをCanonical JSON → UTF-8 → Base64URL形式にエンコード
   - URLパラメータ`s`に格納

2. **デコード**: `src/lib/url-codec.ts`
   - URLパラメータ`s`からBase64URL → JSON → `ConfigV1`オブジェクトに復元

3. **バリデーション**: `src/lib/validation.ts`
   - 年齢（1-150歳）、誕生日（YYYY-MM-DD形式）、タイムゾーン（IANA TZ名）の妥当性チェック

4. **永続化**: `src/lib/storage.ts`
   - LocalStorage（キー: `whilelasts_config`）への読み書きと削除
   - 読み込み時にバリデーションを実行し、不正なデータは自動削除

### ルーティングとガード

`src/routes/view.tsx`の`beforeLoad`フック:

1. URLパラメータ`s`が存在 → デコード・バリデーション成功時はLocalStorageにも保存して`config`を返す
2. URLパラメータが不在またはデコード失敗 → LocalStorageから読み込みを試みる
3. どちらも失敗 → `/settings`にリダイレクト

### feature-basedコンポーネントパターン

ルートファイル（`src/routes/*.tsx`）は薄いラッパー。実装は対応するfeatureコンポーネントに委譲:

- `src/routes/settings.tsx` → `src/features/settings/SettingsPage.tsx`
- `src/routes/view.tsx` → `src/features/view/ViewPage.tsx`

### 時間計算ロジック

`src/lib/time-calculator.ts`:

- **死亡予定日**: 誕生日 + 死亡年齢の誕生日（00:00:00）
- **次の誕生日**: 今年の誕生日が過ぎていれば来年
- **年末/月末**: 23:59:59に設定
- `calculateAllTargets()`で全ての目標日時と残り時間を一括計算

### 多言語対応

`src/i18n/`:

- 日本語（`ja.ts`）と英語（`en.ts`）に対応
- `useI18n()`フックでロケール切り替えと翻訳テキスト取得

### 設定データモデル（v1）

`src/types/config.ts`:

```typescript
{
  v: 1,          // schema version（将来の拡張に対応）
  a: number,     // age at death（死ぬ年齢）
  b: string,     // birthday（YYYY-MM-DD）
  t: string      // time zone（IANA TZ名）
}
```

## ディレクトリ構造

```
src/
├── components/ui/    # shadcn/uiコンポーネント
├── features/        # feature-basedコンポーネント
│   ├── settings/    # 設定画面（SettingsPage.tsx）
│   └── view/        # 残り時間表示画面（ViewPage.tsx, TimeCard.tsx, ShareLinkButton.tsx）
├── i18n/            # 多言語対応
├── lib/             # コアロジック（純関数）
│   ├── url-codec.ts      # Base64URLエンコード/デコード
│   ├── validation.ts     # バリデーション
│   ├── time-calculator.ts # 時間計算
│   ├── storage.ts        # LocalStorage永続化
│   ├── timezones.ts      # タイムゾーンリスト
│   └── utils.ts          # 汎用ユーティリティ（cn等）
├── routes/          # TanStack Routerのファイルベースルーティング
│   ├── __root.tsx   # ルートレイアウト
│   ├── index.tsx    # トップページ
│   ├── settings.tsx # 設定画面（SettingsPageへの薄いラッパー）
│   └── view.tsx     # 残り時間表示画面（ViewPageへの薄いラッパー）
└── types/           # TypeScript型定義
```

## 品質ツーリング

### Lefthook（pre-commitフック）

`lefthook.yml`で定義。TS/JSファイルのステージング時に並列実行:

- `fmt-check`: `pnpm oxfmt --check {staged_files}`
- `lint`: `pnpm oxlint {staged_files} --tsconfig tsconfig.json`
- `type-check`: `pnpm tsc --noEmit`

### Claude Codeフック（`.claude/hooks/`）

- **PostToolUse（Write/Edit後）**: oxfmtフォーマットチェック + oxlintチェックを実行
- **Stop前**: `pnpm tsc --noEmit`で型エラーがないか確認

### CI/CD（GitHub Actions）

`.github/workflows/deploy.yml`: `main`ブランチへのpush時に実行:

1. `pnpm check`（フォーマット + lint + 型チェック）
2. `pnpm build`
3. Cloudflare Pagesへデプロイ

## コーディング規約

### フォーマット（oxfmt）

- 行幅: 100文字
- クォート: ダブルクォート
- Trailing commas: あり

### Linter（oxlint）

- `no-explicit-any: error`
- `no-console: warn`

### コミット規約

Conventional Commits形式を使用:

```
feat(scope): 新機能
fix(scope): バグ修正
refactor(scope): リファクタリング
style(scope): フォーマット変更
docs(scope): ドキュメント更新
build(scope): ビルド設定変更
```

## パスエイリアス

`@/*` は `src/*` にマッピングされています（`tsconfig.json` + `vite.config.ts`）。

## デプロイ

Cloudflare Pagesを想定:

- SPAとして静的ビルド（`pnpm build`）
- 直リンク/リロード対応のため、全パスを`index.html`にフォールバックする設定が必要
