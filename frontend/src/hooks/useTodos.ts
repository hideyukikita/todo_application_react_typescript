////////////////////////////////////////////
//Todoカスタムフック
////////////////////////////////////////////

import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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

// Todoを新規登録するためのカスタムフック
export const useCreateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newTodo: { title: string; memo: string; priority: string; deadline: string}) => {
            const { data } = await api.post('/todos', newTodo);
            return data;
        }, 
        
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['Todos']});
        },
    })
};

// Todoの完了状態や内容を更新するためのカスタムフック
export const useUpdateTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // 引数として更新したいTodoのIDと、更新内容を受け取る
        mutationFn: async({ id, updates }: { id: String; updates: Partial<Todo> }) => {
            const { data } = await api.put(`/todos/${id}`, updates);
            return data;
        },
        // 成功したら一覧を再取得して画面を更新
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['Todos'] });
        }
    })
}