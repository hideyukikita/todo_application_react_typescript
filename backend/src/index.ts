////////////////////////////////////
// サーバー作成用モジュール
///////////////////////////////////
import express from 'express';
import cors from 'cors'
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ExpressのRequest型を拡張し、userプロパティを認識させる
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

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

// JWT_SECRETを環境変数から取得
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Webサーバーの土台作成
const app = express();

app.use(cors());
// JSONを受け取れるようミドルウェア
app.use(express.json());

// 認証用ミドルウェア
const authenticateToken = (req: any, res: any, next: any) => {
    // ヘッダーから'Authorization: Bearer <Token>'を取得
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ error: `ログインが必要です。` });
    }

    jwt.verify(token, JWT_SECRET, (err:any, user: any) => {
        if(err){
            return res.status(403).json({ error: `トークンが無効または期限切れです。`});
        }
        // 検証に成功したらリクエストオブジェクトにユーザー情報を格納
        req.user = user;
        next(); //　次の処理に進む
    })
}

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
app.get('/api/todos', authenticateToken,  async (req, res) => {
    try {
        // SQLの設定
        // req.user.userIdを使ってログインユーザーのTodoのみに絞り込む
        const query = `
            SELECT
                ${TODO_COLUMNS}
            FROM 
                todos
            WHERE
                user_id = $1
            AND
                deleted_at IS NULL
            ORDER BY
                created_at DESC
        `;

        // SQL実行
        const result = await pool.query(query, [req.user!.userId]);
        // 取得したデータをJSONとして返す
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Todo取得エラー: ${error}`);
        res.status(500).json({ error: 'データの取得に失敗しました。'});
    }
});


//[POST] /api/todos Todo新規登録API
app.post('/api/todos', authenticateToken, async (req, res) => {
    // 登録データの変数化
    const { title, memo, priority, deadline } = req.body;

    try {
        const query = `
            INSERT INTO todos (title, memo, priority, deadline, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${TODO_COLUMNS};
        `;

        const values = [title, memo, priority, deadline, req.user!.userId];

        // SQL実行
        const result = await pool.query(query, values);

        // 作成されたデータを返す
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Todo登録エラー: ${error}`);
        res.status(500).json({error: 'データの登録に失敗しました。'});
    }
});


// [PUT] /api/todos/:id Todo更新API
app.put('/api/todos/:id', authenticateToken, async ( req, res ) => {
    // 登録データの変数化
    const { id } = req.params;
    const { title, memo, priority, deadline, is_completed } = req.body;

    try {
        const query = `
        UPDATE
            todos
        SET
            title = $1,
            memo = $2,
            priority = $3,
            deadline = $4,
            is_completed = $5
        WHERE
            id = $6
        AND
            deleted_at IS NULL
        AND
            user_id = $7
        RETURNING 
            ${TODO_COLUMNS};
        `
        const values = [title, memo, priority, deadline, is_completed, id, req.user!.userId];

        // SQL実行
        const result = await pool.query(query, values);

        // 更新タスクがない場合
        if(result.rows.length === 0){
            return res.status(404).json({ error: '対象のタスクが見つかりませんでした。'});
        }

        // 更新後のデータを返す
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Todo更新エラー: ${error}`);
        res.status(500).json({error: 'データの更新に失敗しました。'});
    }
});

// [DELETE] /api/todos/:id Todo論理削除API
app.delete('/api/todos/:id', authenticateToken, async ( req, res) => {
    // 削除データのID取得
    const {id} = req.params;
    
    try {
        const query = `
            UPDATE
                todos
            SET
                deleted_at = NOW()
            WHERE
                id = $1
            AND
                deleted_at IS NULL
            AND
                user_id = $2
            RETURNING
                id
            ;
        `;

        const values = [id, req.user?.userId]
        // SQL実行
        const result = await pool.query(query, values);

        // 削除対象がない場合
        if(result.rows.length === 0){
            return res.status(404).json({ error: '対象のタスクが見つかりませんでした。'});
        }

        //削除成功時は削除したIDを返す
        res.status(200).json({ message: '削除が完了しました。', id: result.rows[0].id });
    } catch (error) {
        console.error(`Todo削除エラー: ${error}`);
        res.status(500).json({ error: 'データの削除に失敗しました。'});
    };
})

// [POST] /api/auth/signup ユーザー新規登録
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // 簡易バリデーション (ZODで強化)
    // TODO
    if(!name || !email || !password) {
        return res.status(400).json({ error: `すべての項目を入力してください。`});
    }

    try {
        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);

        // DBに保存
        const query = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email;
        `;
        const values = [name, email, hashedPassword]
        const result = await pool.query(query, values);

        // 登録成功
        res.status(201).json({
            message: `ユーザー登録が完了しました。`,
            user: result.rows[0]
        });
    } catch (error: unknown) {
        console.log(`登録エラー: ${error}`);
        // メールアドレスがすでに存在する際のハンドリング
        if (error instanceof Object && 'code' in error){
            const err = error as { code: string}; // 型を安全にキャスト
            if( err.code === '23505') {
                return res.status(400).json({error: `このメールアドレスは既に使用されています。`});
            }
        }
        res.status(500).json({ error: `登録に失敗しました。`});
    }
})

// [POST] /api/auth/login ログイン(トークン発行)
app.post('/api/auth/login', async(req, res) => {
    const { email, password } = req.body;

    try {
        // ユーザーの検索
        const query = ` SELECT id, name, email, password FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);

        if(result.rows.length === 0) {
            return res.status(401).json({ error: `メールアドレスまたはパスワードが正しくありません。`});
        }

        const user = result.rows[0];

        // パスワードの照合(入力されたパスワードとDBのパスワードの比較)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: `メールアドレスまたはパスワードが正しくありません。`});
        }

        // JWTトークンの発行
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 成功レスポンス
        return res.status(200).json({
            message: `ログインに成功しました。`,
            token,
            user: {id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.log({error: `ログインエラー: ${error}`});
        res.status(500).json({ errro: `ログイン処理に失敗しました。`});
    }
});

// [GET] '/api/todos/stats 可視化用の統計データ取得
app.get('/api/todos/stats', authenticateToken, async(req, res) => {
    try {
        // 完了・未完了のカウント
        const ratioQuery = `
            SELECT
                COUNT(*) FILTER(WHERE is_completed = true) as completed_count,
                COUNT(*) FILTER(WHERE is_completed = false) as active_count
            FROM
                todos
            WHERE
                user_id = $1
            AND
                deleted_at IS NULL
        `;

        // 直近7日間の日別完了数
        // PostgreSQLの集計機能を使ってサーバー側で計算
        const dailyQuery = `
            SELECT
                TO_CHAR(deadline AT TIME ZONE 'JST', 'MM/DD') as date,
                COUNT(*) as count
            FROM
                todos
            WHERE
                user_id = $1
            AND 
                is_completed = true
            AND 
                deleted_at IS NULL
            AND
                deadline >= NOW() - INTERVAL '7 days'
            GROUP BY
                date
            ORDER BY
                date ASC;
        `;

        const ratioResult = await pool.query(ratioQuery, [req.user!.userId]);
        const dailyResult = await pool.query(dailyQuery, [req.user!.userId]);

        res.status(200).json({
            ratio: {
                completed: parseInt(ratioResult.rows[0].completed_count || '0'),
                active: parseInt(ratioResult.rows[0].active_count || '0')
            },
            daily: dailyResult.rows
        });
    } catch (error) {
        console.log(`統計取得エラー: ${error}`);
        res.status(500).json({ message: `統計データの取得に失敗しました。` });
    }
});

// サーバーの起動
app.listen(PORT, () => {
    console.log(`\n${PORT}番ポートでサーバーが起動しました。`);
})