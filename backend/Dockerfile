# Node.js 22 の計量版を使用
FROM node:22-alpine

WORKDIR /app

# パッケージ定義をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# 実行
EXPOSE 3000
CMD ["npm", "run", "dev"]