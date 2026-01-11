# 学習管理アプリ作成
## 概要
- Docker+React+TypeScriptを用いた学習管理アプリを作成する

## アプリケーションの全体像
### アプリケーション構成の全体像
1. Frontend
   - React(Vite) + TypeScript + Tailwind CSS 
2. Backend
   - Node.js(Express) + TypeScript
3. Database
   - PostgreSQL
4. Infrastructure
   - Docker/Docker Compose

## 作業手順
1. プロジェクトのディレクトリ作成
    - 下記ディレクトリ構成で作成を行う
    ```
    learning-tracker/
        ├── docker-compose.yml
        ├── frontend/ (React)
        │   ├── Dockerfile
        │   └── ...
        └── backend/ (Node.js/Express)
        ├── Dockerfile
        └── ...
    ```
2. Docker環境の構築
    - `docker-compose.yml`を作成し、3つのコンテナ(フロント・バック・DB)が連携できるようにする。
    - DBのデータが消えないよう、Docker Volumesを設定する。
    - ~~DBの中身をブラウザで見れるよう、`pgAdmin`コンテナの追加も視野に~~A5M2を利用するため今回はなし。
3. バックエンド(API)の実装
    - 学習記録を保存するためのAPIを作成する。
    - 実装内容
      1. `GET /study-logs`: 学習記録一覧の取得
      2. `POST /study-logs`: 新しい学習内容の登録
      3. `PATCH /study-logs/:id`: 「残り学習」の更新
    - TypeScriptの活用
      - リクエストとレスポンスの型定義をしっかりと行いましょう。
    - ORM: Prismaを使うと、TypeScriptとの相性が抜群で、DB操作が楽になるのでお勧めです。(この分意味が分からん)
4. フロントエンド(React)の実装
   - Viteを使ってプロジェクトを立ち上げ、APIと連携させます。
   - 主要な機能
     - Dashboard: 「学習済み時間」と「残り予定時間」をグラフ（Recharts など）で可視化。
     - Input Form: 「今日何を学んだか」「次は何を学ぶか」を入力。
     - Persistence: データはバックエンドのPostgreSQLに保存。
   - 通信
     - `Axios`や`TanStack Query(React Query)`（このQueryってなんだ？）を使ってDocker上のAPIからデータを取得します。
5. Dockerでの一斉起動
   - コマンド1つで環境を立ち上げる。
     ```
        docker-compose up --build
     ```
   - ブラウザで`localhost:5173`にアクセスし、入力したデータが`PostgresSQL`まで届き、リロードしても消えないことを確認する。 

## チャレンジ要素
- バリデーション(入力チェック)
  - 「学習時間は数値のみ」「タイトルは必須」などのチェックを、Zod というライブラリを使ってフロントとバック両方で共通の型定義として使うと、TypeScriptの真価がさらにわかります。
- 環境変数の管理
  - DBのパスワードやAPIのURLを .env ファイルに切り出し、Docker経由で読み込ませる。
- 他デバイスから受付
  - WiFi経由で他のデバイス（スマホなど）からも学習記録を付けられるようにする
- ユーザー管理
  - パスのハッシュ化とJWTの利用を念頭に 



