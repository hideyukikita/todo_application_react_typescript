import express from 'express';
import cors from 'cors';



const app = express();
const PORT = 3000;

app.use(cors());  // フロントエンドからの接続を許可
app.use(express.json());

//GET:ToDo一覧取得API
app.get('/api/todos', async(req, res) =>{
    try {
        const todos = await prisma.todo.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの取得に失敗しました。' });
    }
});

// POST:ToDoの新規登録
app.post('/api/todos', async(req, res) => {
    //登録データの変数化
    const { title, memo, priority, deadline, userId } = req.body;
    try {
         const newTodo = await prisma.todo.create({
            data: {
                title,
                memo,
                priority,
                deadline: new Date(deadline),
                userId, //CHECK:Phase1では適当なUUIDまたは後で作成するUserIDを想定 
            }
         });
    res.status(201).json(newTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'データの登録に失敗しました。'});
    }
});

// サーバーの起動
app.listen(PORT, () => {
    console.log(`\n${PORT}番ポートでサーバーが起動しました。`)
});