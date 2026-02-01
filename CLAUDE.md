# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**whilelasts** は、人生の残り時間をさまざまな単位で可視化するフロントエンドのみのWebアプリケーションです。

- DBなし・APIサーバーなし
- 設定情報は全てURLのクエリパラメータ（`s`パラメータ）にBase64URL形式でエンコードして保持
- URLが唯一の永続状態であり、URLを共有することで設定を復元可能

## 開発コマンド

```bash
# 開発サーバーの起動
pnpm dev

# プロダクションビルド
pnpm build

# ビルドしたアプリのプレビュー
pnpm preview
```

## 技術スタック

- **フレームワーク**: React 19 + TypeScript + Vite
- **ルーティング**: TanStack Router (file-based routing)
- **UI**: shadcn/ui + Tailwind CSS v4
- **日時計算**: date-fns + date-fns-tz
- **パッケージマネージャー**: pnpm

## コアアーキテクチャ

### 設定データフロー

1. **エンコード**: `src/lib/url-codec.ts`
   - `ConfigV1`型のオブジェクトをCanonical JSON → UTF-8 → Base64URL形式にエンコード
   - URLパラメータ`s`に格納

2. **デコード**: `src/lib/url-codec.ts`
   - URLパラメータ`s`からBase64URL → JSON → `ConfigV1`オブジェクトに復元

3. **バリデーション**: `src/lib/validation.ts`
   - 年齢（1-150歳）、誕生日（YYYY-MM-DD形式）、タイムゾーン（IANA TZ名）の妥当性チェック

### ルーティングとガード

`src/routes/view.tsx`の`beforeLoad`フック:
- `s`パラメータが不在、デコード失敗、バリデーション失敗時は全て`/settings`にリダイレクト
- 成功時は復元した`config`をルートコンテキストに渡す

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
├── i18n/            # 多言語対応
├── lib/             # コアロジック（純関数）
│   ├── url-codec.ts      # Base64URLエンコード/デコード
│   ├── validation.ts     # バリデーション
│   ├── time-calculator.ts # 時間計算
│   └── timezones.ts      # タイムゾーンリスト
├── routes/          # TanStack Routerのファイルベースルーティング
│   ├── __root.tsx   # ルートレイアウト
│   ├── index.tsx    # トップページ
│   ├── settings.tsx # 設定画面
│   └── view.tsx     # 残り時間表示画面
└── types/           # TypeScript型定義
```

## パスエイリアス

`@/*` は `src/*` にマッピングされています（`tsconfig.json` + `vite.config.ts`）。

## デプロイ

Cloudflare Pagesを想定:
- SPAとして静的ビルド（`pnpm build`）
- 直リンク/リロード対応のため、全パスを`index.html`にフォールバックする設定が必要
