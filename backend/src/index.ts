////////////////////////////////////
// サーバー作成用モジュール
///////////////////////////////////

import express from 'express';
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESMで__dirnameを再現するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//ルート直下の.envを読み込む
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// サーバーポートを環境変数から取得
const PORT = process.env.SERVER_PORT || 3000;

// Webサーバーの土台作成
const app = express();

// テスト用API(DBの現在日時取得)
app.get('/api/healthcheck', async (req, res) => {
    try {
        // DBの現在日時の取得
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({
            status: 'OK',
            db_time: result.rows[0].now
        });
    } catch (error) {
        console.error(`DB接続エラー: ${error}`);
        res.status(500).json({ error: 'DBに接続できません。'});
    }
});

app.listen(PORT, () => {
    console.log(`\n${PORT}番ポートでサーバーが起動しました。`);
})