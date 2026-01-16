import React, { useState } from 'react';
import { useCreateTodo } from '../hooks/useTodos';
import { PlusCircle } from 'lucide-react';

export const TodoForm = () => {
    
    // 入力日から1か月後を計算する関数
    const getInitialDeadline = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1); // 1か月後を設定

        // 日本時間(JST)のYYYY-MM-DDTHH:mm形式に整形
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2,'0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    const [title, setTitle] = useState('');
    const [memo, setMemo] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [deadline, setDeadline] = useState(getInitialDeadline());
    
    const createTodoMutation = useCreateTodo();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !deadline) return alert('タイトルと締切は必須です');

        createTodoMutation.mutate({ title, memo, priority, deadline }, {
            onSuccess: () => {
                //成功したらフォームリセット
                setTitle('');
                setMemo('');
                setPriority('MEDIUM');
                setDeadline(getInitialDeadline());
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input 
                    type="text"
                    placeholder="タスク名を入力..."
                    className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="datetime-local"
                    className='p-2 border rounded-lg focus:ring2 focus:ring-blue-500 outline-none'
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <textarea
                    placeholder="メモ(任意)"
                    className='p-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none'
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />
                <select 
                    className='p-2 border rounded-lg outline-none'
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value='HIGH'>優先度:高</option>
                    <option value='MEDIUM'>優先度:中</option>
                    <option value='LOW'>優先度:低</option>
                </select>
                <button
                    type='submit'
                    disabled={createTodoMutation.isPending}
                    className='bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-300'
                >
                    <PlusCircle className='mr-2 w-5 h-5' />
                    {createTodoMutation.isPending ? '登録中...' : 'タスクを追加'}
                </button>
            </div>
        </form>
    );
};