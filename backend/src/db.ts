/////////////////////////////////
// DB操作用モジュール
//////////////////////////////////

import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// プロジェクトルートの.envを読み込む
dotenv.config({ path: path.resolve(__dirname, '../../.env')});

// DB接続設定を環境変数から取得
const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
};

// DB接続プールを作成
export const pool = new Pool(poolConfig);

// 接続確認ログ
pool.on('connect', () => {
    console.log(`PostgreSQL接続成功:\nホスト:${poolConfig.host}\nDB名:${poolConfig.database}\nポート:${poolConfig.port}`);
});

pool.on('error', (error) => {
    console.error(`エラーが発生しました。${error}`);
    process.exit(-1);
});