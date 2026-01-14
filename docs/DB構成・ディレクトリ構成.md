# ディレクトリ構成
```
learning-tracker/
├── docker-compose.yml
├── .env                  # 全体で使う環境変数
├── backend/              # Node.js (Express) + Prisma
│   ├── src/
│   │   ├── controllers/  # リクエスト処理のロジック
│   │   ├── middlewares/  # 認証(JWT)やZodバリデーション
│   │   ├── routes/       # ルーティング定義
│   │   ├── services/     # DB操作 (Prisma)
│   │   ├── utils/        # 共通関数 (bcrypt, JWT生成)
│   │   └── index.ts      # エントリーポイント
│   ├── prisma/
│   │   └── schema.prisma # DB設計図
│   ├── Dockerfile
│   └── package.json
├── frontend/             # React (Vite)
│   ├── src/
│   │   ├── components/   # UI部品
│   │   ├── hooks/        # TanStack Query等のカスタムフック
│   │   ├── pages/        # Dashboard, Login等の画面単位
│   │   ├── lib/          # axios, zodaの設定
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── shared/               # 【重要】フロントとバックで共有する型やZodスキーマ
│   └── index.ts          # Zodの定義などをここに置くと型がズレない
└──docs
```

# DB構成
## Userテーブル(ユーザー情報)
| カラム名 | 型 | 説明 |
|---------| --- | ----- |
| id | String(UUID) | 主キー |
| email | String | ユニーク(ログインID) |
| password | String | ハッシュ化されたパスワード |
| name | String | 表示名 |

## ToDo(タスク情報)
| カラム名 | 型 | 説明 |
|---------| --- | ----- |
| id | String(UUID) | 主キー |
| UserId | String | 外部キー(User.idと紐づけ) |
| title | String | タスク名 |
| memo | String | 詳細メモ |
| priority | Enum | `HIGH`,`MEDIUM`,`LOW` |
| deadline | DateTime | 締切日 |
| isCompleted | Boolean | 完了フラグ(初期値:false) |
| createdAt | DateTime | 作成日時 |
| deletedAt | DateTime | 削除日時(ここが値を持てば削除済み) |