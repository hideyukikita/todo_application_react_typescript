# Node.js 22 の軽量版を利用
FROM node:22-alpine

WORKDIR /app

# パッケージ定義をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# Vite 7 では 5173 ポートを使用
EXPOSE 5173

# Viteの --host 設定を有効にして外部(スマホ等)から接続可能にする
CMD ["npm", "run", "dev", "--", "--host"]