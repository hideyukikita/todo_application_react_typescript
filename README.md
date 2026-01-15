# 📋 高機能ToDo管理アプリ (Phase 1 完了)

2026年最新の技術スタックを用いた、家庭内共有可能なToDo管理アプリケーション。
Phase 1 では、Dockerベースのインフラ構築、バックエンドCRUD基盤、およびフロントエンドの一覧表示実装を完了しました。

## 🚀 技術スタック
- **Frontend**: React (Vite 7), TypeScript, Tailwind CSS v4, TanStack Query, Axios
- **Backend**: Node.js (Express), TypeScript, pg (node-postgres)
- **Database**: PostgreSQL 16 (Docker)
- **Infrastructure**: Docker Compose, .env による環境変数一元管理

## 🛠 技術的な意思決定 (2026/01/15 備忘録)

### 1. データベース接続とORMの選定
- **脱Prismaの方針**: Prisma 7 における特定環境下の接続トラブル（ポート51214への誤接続）を回避するため、`pg` ライブラリによる直接的なSQL実行方式へ移行。これにより、意図しないモックDBへの接続を完全に排除し、安定したDB接続を実現した。

### 2. タイムゾーンの厳格な運用
- **DB保存**: データのポータビリティを重視し、DB内部（PostgreSQL）は標準時（UTC）で保存。
- **データ取得**: 取得時に SQL クエリ内で `AT TIME ZONE 'JST'` を用いて明示的に日本時間へ変換。
  - 実装例: `SELECT TO_CHAR(NOW() AT TIME ZONE 'JST', 'YYYY-MM-DD HH24:MI:SS')`
- **理由**: インフラ（Docker設定）に依存せず、アプリケーション側で確実に日本時間を制御するため。

### 3. モダンな開発環境への対応
- **ES Modules (ESM)**: 全体で ESM を採用。`import` 文には `.js` 拡張子を付与し、`db.ts` 等では `import.meta.url` を用いてパス解決を行うことで、Node.js v22 系統の最新仕様に準拠。
- **Vite Proxy**: フロントエンド（Port 5173）からバックエンド（Port 3000）への通信は Vite のプロキシ機能を活用し、開発時の CORS 制約を解消。

## 📁 主要構成
- `backend/`: Expressサーバー、SQLクエリ、DB接続管理
- `frontend/`: Reactコンポーネント、カスタムフック、スタイル定義
- `docker-compose.yml`: PostgreSQLコンテナ設定（.env 連携済み）

## 🚦 今後のロードマップ
- **Phase 2**: WiFi共有テスト、スマホからのアクセス確認、CORS設定の最適化。
- **Phase 3**: JWT認証の実装、Zodによるバリデーション、タスク統計の可視化。
