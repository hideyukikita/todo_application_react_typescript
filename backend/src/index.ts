////////////////////////////////////
// サーバー作成用モジュール
///////////////////////////////////
import express from 'express';
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

//PostgreSQLのTIMESTAMPを日本時間の文字列に変換する共通フォーマット
const JST_TIME_FORMAT = (column: string) => `TO_CHAR(${column} AT TIME ZONE 'JST', 'YYYY-MM-DD HH24:MI:SS')`;

// Todoテーブルの標準的な選択カラム(日本時間変換込み)
const TODO_COLUMNS = `
    id, title, memo, priority, is_completed,
    ${JST_TIME_FORMAT('deadline')} as deadline,
    ${JST_TIME_FORMAT('created_at')} as created_at
`;

// ESMで__dirnameを再現するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//ルート直下の.envを読み込む
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// サーバーポートを環境変数から取得
const PORT = process.env.SERVER_PORT || 3000;

// Webサーバーの土台作成
const app = express();

// JSONを受け取れるようミドルウェア追加
app.use(express.json());

// テスト用API(DBの現在日時取得)
app.get('/api/healthcheck', async (req, res) => {
    try {
        // DBの現在日時の取得
        const result = await pool.query(
             `SELECT ${JST_TIME_FORMAT('NOW()')} as jst_time`
        );
        res.status(200).json({
            status: 'OK',
            db_time: result.rows[0].jst_time
        });
    } catch (error) {
        console.error(`DB接続エラー: ${error}`);
        res.status(500).json({ error: 'DBに接続できません。'});
    }
});


// [GET] /api/todos Todo一覧取得API
app.get('/api/todos', async (req, res) => {
    try {
        // SQLの設定
        const query = `
            SELECT
                ${TODO_COLUMNS}
            FROM 
                todos
            WHERE
                deleted_at IS NULL
            ORDER BY
                created_at DESC
        `;
        // 結果の格納
        const result = await pool.query(query);
        // 取得したデータをJSONとして返す
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Todo取得エラー: ${error}`);
        res.status(500).json({ error: 'データの取得に失敗しました。'});
    }
});


//[POST]Todo新規登録API
app.post('/api/todos', async (req, res) => {
    // 登録データの変数化
    const { title, memo, priority, deadline } = req.body;

    try {
        const query = `
            INSERT INTO todos (title, memo, priority, deadline)
            VALUES ($1, $2, $3, $4)
            RETURNING ${TODO_COLUMNS};
        `;
        const values = [title, memo, priority, deadline];
        const result = await pool.query(query, values);

        // 作成されたデータを返す
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Todo登録エラー: ${error}`);
        res.status(500).json({error: 'データの登録に失敗しました。'});
    }
});


app.listen(PORT, () => {
    console.log(`\n${PORT}番ポートでサーバーが起動しました。`);
})