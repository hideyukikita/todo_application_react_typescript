# 📋 高機能ToDo管理アプリ
- 2026年最新の技術スタックを用いた、家庭内共有可能なToDo管理アプリケーション。
- **マルチデバイス対応**: WSL2環境からネットワークを開放し、スマホやタブレットからリアルタイムにタスク管理が可能。
- **堅牢な設計**: フロント・バック間でZodスキーマを共有し、不正データの混入を完全にシャットアウト。
  
## 🚀 技術スタック
- **Frontend**: React (Vite 7), TypeScript, Tailwind CSS v4, TanStack Query, Axios
- **Backend**: Node.js (Express), TypeScript, pg (node-postgres)
- **Database**: PostgreSQL 16 (Docker)
- **Infrastructure**: Docker Compose, .env による環境変数一元管理

## 🛠 実行・開発手順 (スマホ接続対応)
### 1. サーバーの起動
  1. プロジェクトのルートディレクトリで以下のコマンドを実行する。

```bash
# 全サービスをビルドしてバックグラウンドで起動
docker compose up -d --build
```
### 2. スマホ接続のための自動設定(WSL2環境)
- WSL2の内部IPは変動するため、プロジェクトルートにある自動化スクリプトを使用してWindows側の通り道を確保します。
1. Windows側でPowerShellを「管理者として実行」する。
2. プロジェクトルートへ移動し、以下のスクリプトを実行する。
```bash
# 実行ポリシーの許可(初回のみ)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# スクリプトの実行
.\Connect-SWL.ps1
```
1. PCのIPアドレスを確認し、ルート直下の`.env`内にある`VITE_API_URL`を更新後、再起動する
- **PowerShell**
```bash
ipconfig # Wi-FiのIPv4アドレス(例:192.168.0.222)を確認
```
- **env**
```bash
# .env
VITE_API_URL=http://192.168.0.222:3000
```
### 3. スマホからのアクセス
- PCと同じWi-Fiに接続したスマホのブラウザからアクセスします。
- アプリホーム画面: `http://[PCのIPアドレス]:5173`
- API疎通確認: `http://[PCのIPアドレス]:3000/api/healthcheck
`

## 🛠 技術的な意思決定

### 1. データベース接続とORMの選定
- **脱Prismaの方針**: Prisma 7 における特定環境下の接続トラブル（ポート51214への誤接続）を回避するため、`pg` ライブラリによる直接的なSQL実行方式へ移行。これにより、意図しないモックDBへの接続を完全に排除し、安定したDB接続を実現した。

### 2. タイムゾーンの厳格な運用
- **DB保存**: データのポータビリティを重視し、DB内部（PostgreSQL）は標準時（UTC）で保存。
- **データ取得**: 取得時に SQL クエリ内で `AT TIME ZONE 'JST'` を用いて明示的に日本時間へ変換。
  - 実装例: `SELECT TO_CHAR(NOW() AT TIME ZONE 'JST', 'YYYY-MM-DD HH24:MI:SS')`
- **理由**: インフラ（Docker設定）に依存せず、アプリケーション側で確実に日本時間を制御するため。

### 3. モダンな開発環境への対応
- **ES Modules (ESM)**: 全体で ESM を採用。`import` 文には `.js` 拡張子を付与し、`db.ts` 等では `import.meta.url` を用いてパス解決を行うことで、Node.js v22 系統の最新仕様に準拠。
- **Vite Proxy**: フロントエンド（Port 5173）からバックエンド（Port 3000）への通信は Vite のプロキシ機能を活用し、開発時物理IPによる直接通信: スマホ等の外部デバイスからWSL2上のバックエンドへアクセスするため、Vite Proxy（localhost前提）に依存せず、フロントエンドからPCの物理IPアドレスを直接参照する構成を採用。
- **WSL2ポート転送の自動化**: Connect-SWL.ps1 を作成し、変動するWSL2内部IPとWindowsホスト間のポートフォワーディングを自動化。

## 📁 主要構成
- `backend/`: Expressサーバー、SQLクエリ、DB接続管理
- `frontend/`: Reactコンポーネント、カスタムフック、スタイル定義
- `docker-compose.yml`: PostgreSQLコンテナ設定（.env 連携済み）

## 🚦 今後のロードマップ
- **Phase 3**: JWT認証の実装、Zodによるバリデーション、タスク統計の可視化。
