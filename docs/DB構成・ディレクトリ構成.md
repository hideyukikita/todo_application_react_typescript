# ディレクトリ構成
```
todo_application_react_typescript/
├── docker-compose.yml        # 全サービス(DB/Back/Front)の一括管理
├── .env                      # プロジェクト全体の環境変数 (DB接続・物理IP・JWT等)
├── .dockerignore             # node_modules等のビルド除外設定
├── Connect-SWL.ps1           # WSL2からWindowsホストへのポートマッピング自動化
├── backend/                  # Node.js (Express) - ESM仕様
│   ├── Dockerfile            # Node.js 22-alpineベース
│   ├── src/
│   │   ├── db.ts             # pg (node-postgres) 接続・プール設定
│   │   └── index.ts          # API定義・Zodバリデーション・JWT認証
│   ├── package.json          # nodemon, ts-node/esm 等の定義
│   └── tsconfig.json
├── frontend/                 # React (Vite 7)
│   ├── Dockerfile            # Vite --host 設定込み
│   ├── src/
│   │   ├── components/       # TodoForm(RHF+Zod), TodoStats(Recharts) 等
│   │   ├── context/          # AuthContext (ログイン状態保持)
│   │   ├── hooks/            # useTodos, useAuth 等のカスタムフック
│   │   ├── lib/              # axiosインスタンス設定
│   │   └── App.tsx
│   ├── vite.config.ts        # server.host: true 設定
│   └── package.json          # react-hook-form, zod, lucide-react 等
├── shared/                   # 【型共有】フロント・バック共通資産
│   ├── index.ts              # Zodスキーマ (todo/signup/login) 定義
│   └── package.json          # "type": "module" 定義
└── docs/                     # 最終設計書・開発記録

```

# DB構成
## Userテーブル(ユーザー情報)
| カラム名 | 型 | 説明 |
|---------| --- | ----- |
| id | UUID | 主キー |
| email | String | ユニーク(ログインID) |
| password | String | ハッシュ化されたパスワード |
| name | String | 表示名 |

## ToDo(タスク情報)
| カラム名 | 型 | 説明 |
|---------| --- | ----- |
| id | UUID | 主キー |
| user_id | String | 外部キー(User.idと紐づけ) |
| title | String | タスク名 |
| memo | String | 詳細メモ |
| priority | Enum型 | `HIGH`,`MEDIUM`,`LOW` |
| deadline | DateTime | 締切日 |
| is_completed | Boolean | 完了フラグ(初期値:false) |
| created_at | DateTime | 作成日時 |
| deleted_at | DateTime | 削除日時(ここが値を持てば削除済み) |