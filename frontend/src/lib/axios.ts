import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプター
api.interceptors.request.use(
    (config) => {
        // localStrageから保存されたトークンを取得
        const token = localStorage.getItem('todo_app_token');

        if(token) {
            // ヘッダーに'Authorization:Bearer<TOKEN>'を付与
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// レスポンスインターセクター(トークン切れ対応)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // もしサーバーから「401 Unauthorized(認証エラー)」が帰ってきたら強制ログアウト
        if(error.response?.status === 401){
            localStorage.removeItem('todo_app_token');
            // TODO
            // ログイン画面へのリダイレクト(window.location.href = 'loginなど)
        }
        return Promise.reject(error);
    }
);

export default api;