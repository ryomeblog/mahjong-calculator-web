# Project: mahjong-calculator-web

## Tech Stack
- Vite 7 + React 19 + TypeScript (strict mode)
- Tailwind CSS 4
- React Router DOM 7

## Build & Dev
- `npm run dev` - 開発サーバー起動
- `npm run build` - TypeScriptチェック + Viteプロダクションビルド (`tsc -b && vite build`)
- `npm run preview` - プロダクションビルドのプレビュー
- `npm run lint` - ESLint実行

## Deployment (GitHub Pages)
- `vite.config.ts` の `base` は `/mahjong-calculator-web/` に設定済み
- `.github/workflows/deploy.yml` でGitHub Actionsによる自動デプロイ設定済み
- `main` ブランチへのpushで自動ビルド・デプロイされる
- GitHub設定でPages SourceをGitHub Actionsに変更が必要
- デプロイ先URL: https://ryomeblog.github.io/mahjong-calculator-web/

## Path Alias
- `@/` は `src/` にマッピング済み
