import React, { useState, useEffect } from 'react';
import { useCreateTodo, useUpdateTodo } from '../hooks/useTodos';
import type { Todo } from '../hooks/useTodos';
import { PlusCircle, Save } from 'lucide-react';

interface TodoFormProps {
    editTodo?: Todo | null; //編集対象がある場合はTodo、ない場合はnull
    onClose?: () => void; // モーダルを閉じるための関数
}

export const TodoForm = ( { editTodo, onClose }: TodoFormProps ) => {
    
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

    // 各入力項目のステート管理
    const [title, setTitle] = useState('');
    const [memo, setMemo] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
    const [deadline, setDeadline] = useState(getInitialDeadline());
    
    const createTodoMutation = useCreateTodo();
    const updateTodoMutation = useUpdateTodo();

    // 編集対象(editTodo)がセットされたら、入力欄にその値を反映させる
    useEffect(() => {
        if(editTodo){
            setTitle(editTodo.title);
            setMemo(editTodo.memo || '');
            setPriority(editTodo.priority);
            // DBの”YYYY-MM-DD HH:mm:ss”を"YYYY-MM-DDTHH:mm"に変換してセット
            const formattedDate = editTodo.deadline.replace(' ', 'T').slice(0, 16);
            setDeadline(formattedDate);
        }
    }, [editTodo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !deadline) return alert('タイトルと締切は必須です');

        // 編集モード
        if(editTodo){
            updateTodoMutation.mutate({
                id: editTodo.id,
                updates: { title, memo, priority, deadline, is_completed: editTodo.is_completed}
            },{
                onSuccess: () => onClose?.()
            })
        } else {
            // 新規登録モード
            createTodoMutation.mutate({ title, memo, priority, deadline }, {
                onSuccess: () => {
                    //成功したらフォームリセット
                    setTitle('');
                    setMemo('');
                    setPriority('MEDIUM');
                    setDeadline(getInitialDeadline());
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`bg-white p-6 rounded-xl ${editTodo ? '' : 'shadow-sm border border-gray-100 mb-8'}`}>
            {editTodo && <h2 className='text-xl font-bold mb-4 text-gray-700'>タスクを編集</h2>}

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
                    placeholder="メモ"
                    className='p-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500 outline-none'
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />
                <select 
                    className='p-2 border rounded-lg outline-none'
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                >
                    <option value='HIGH'>優先度:高</option>
                    <option value='MEDIUM'>優先度:中</option>
                    <option value='LOW'>優先度:低</option>
                </select>
                <div className='md:col-span-2 flex flex-col gap-2'>
                    <button
                        type='submit'
                        disabled={createTodoMutation.isPending || updateTodoMutation.isPending}
                        className='w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-300'
                    >
                        {editTodo ? <Save className='mr-2 w-5 h-5' /> : <PlusCircle className='mr-2 w-5 h-5' />}
                        {editTodo 
                            ? (updateTodoMutation.isPending ? '更新中...' : '変更を保存')
                            : (createTodoMutation.isPending ? '登録中...': 'タスクを追加')
                        }
                    </button>
                    {/* 編集時のみキャンセルボタンを表示 */}
                    {editTodo && (
                        <button
                            type='button'
                            onClick={onClose}
                            className='w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors'
                        >
                            キャンセル
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};