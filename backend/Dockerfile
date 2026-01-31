# Node.js 22 の計量版を使用
FROM node:22-alpine

WORKDIR /app

# パッケージ定義をコピーしてインストール
COPY backend/package*.json ./
RUN npm install

# ソースコードをコピー
COPY backend/ ./backend
COPY shared/ ./shared/

# 実行
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "run", "dev"]