# ディレクトリ構成
```
todo_application_react_typescript/
├── docker-compose.yml
├── .env                      # 全体・DB用環境変数
├── Connect-SWL.ps1           # WSL2ポート転送自動化スクリプト
├── backend/                  # Node.js (Express)
│   ├── src/
│   │   ├── db.ts             # pg (node-postgres) 接続設定
│   │   └── index.ts          # エントリーポイント・API定義
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React (Vite 7)
│   ├── .env                  # API接続先(物理IP)を定義
│   ├── src/
│   │   ├── components/       # UI部品
│   │   ├── hooks/            # useTodos, useMutation等のカスタムフック
│   │   ├── lib/              # axiosインスタンス設定
│   │   └── App.tsx
│   ├── vite.config.ts        # host: true 設定済み
│   └── package.json
├── shared/                   # 【Phase 3で使用】共通Zodスキーマ・型定義
└── docs/                     # 設計書・進捗管理
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