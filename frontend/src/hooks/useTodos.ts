////////////////////////////////////////////
//Todo一覧取得カスタムフック
////////////////////////////////////////////

import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

// Todoアイテムの型定義
export interface Todo {
    id: string
    title: string
    memo: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    is_completed: boolean
    deadline: string
    created_at: string
}

// Todo一覧を取得するためのカスタムフック
export const useTodos = () => {
    return useQuery<Todo[]>({
        // キャッシュ管理のためのキー。データ再取得などに使用されます。
        queryKey: ['Todos'],
        //実際の通信ロジック。axiosインスタンスを利用
        queryFn: async () => {
            const { data } = await api.get('/todos')
            return data
        },
    })
}