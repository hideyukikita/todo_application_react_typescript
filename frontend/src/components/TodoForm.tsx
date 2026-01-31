import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema } from '../../../shared/index';
import type { TodoInput } from '../../../shared/index';
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
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // React Hook Formの初期化
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TodoInput>({
            resolver: zodResolver(todoSchema),
            defaultValues: {
                title: '',
                memo: '',
                priority: 'MEDIUM',
                deadline: getInitialDeadline(),
            },
    });

    
    const createTodoMutation = useCreateTodo();
    const updateTodoMutation = useUpdateTodo();

    // 編集対象(editTodo)がセットされたら、入力欄にその値を反映させる
    useEffect(() => {
        if (editTodo) {
            // reset関数を使ってフォーム全体に値をセット
            reset({
                title: editTodo.title,
                memo: editTodo.memo || '',
                priority: editTodo.priority,
                // DBの'YYYY-MM-DD HH:mm:ss'を'YYYY-MM-DDTHH:mm'に変換
                deadline: editTodo.deadline.replace(' ', 'T').slice(0, 16),
            });
        }
    }, [editTodo, reset]);

    // 送信処理(handleSubmit(onSubmit))の形で呼び出す
    const onSubmit = (data: TodoInput) => {
        // データ送信用にメモのundefinedを空文字に変換
        const payload = {
            ...data,
            memo: data.memo ?? '', //undefinedなら空文字にする
        };

        // 編集モード
        if (editTodo) {
            updateTodoMutation.mutate({
                id: editTodo.id,
                updates: {
                    ...payload,
                    is_completed: editTodo.is_completed?? false //安全のためにdefault値を考慮
                }
            }, {
                onSuccess: () => onClose?.()
            });
        } else {
            // 新規登録モード
            createTodoMutation.mutate( payload, {
                onSuccess: () => {
                    // 成功したらフォームを初期状態にリセット
                    reset();
                }
            });
        }
    };

    return (
        // handleSubmitはZodのバリデーションを実行してからonSubmitを呼ぶ
        <form onSubmit={handleSubmit(onSubmit)} className={`bg-white p-6 rounded-xl ${editTodo ? '' : 'shadow-sm border border-gray-100 mb-8'}`}>
            {editTodo && <h2 className='text-xl font-bold mb-4 text-gray-700'>タスクを編集</h2>}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* タイトル入力欄 */}
                <div className='flex flex-col gap-1'>
                    <input 
                        {...register('title')} //registerを使って紐づけ
                        type='text'
                        placeholder='タスク名を入力...'
                        className={`p-2 border rounded-lg focus:ring-2 outline-none ${errors.title ? 'border-red-500 focus:ring-red-200': 'focus:ring-blue-500'}`}
                    />
                    {errors.title && <span className='text-red-500 text-xs'>{errors.title.message}</span>}
                </div>
                {/* 締切入力欄 */}
                <div className="flex flex-col gap-1">
                    <input
                        {...register('deadline')}
                        type="datetime-local"
                        className={`p-2 border rounded-lg focus:ring-2 outline-none ${errors.deadline ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-500'}`}
                    />
                    {errors.deadline && <span className="text-red-500 text-xs">{errors.deadline.message}</span>}
                </div>
                {/* メモ入力欄 */}
                <div className="flex flex-col gap-1 md:col-span-2">
                    <textarea
                        {...register('memo')}
                        placeholder="メモ"
                        className={`p-2 border rounded-lg focus:ring-2 outline-none ${errors.memo ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-500'}`}
                    />
                    {errors.memo && <span className="text-red-500 text-xs">{errors.memo.message}</span>}
                </div>
                {/* 優先度選択 */}
                <div className="flex flex-col gap-1">
                    <select 
                        {...register('priority')}
                        className='p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500'
                    >
                        <option value='HIGH'>優先度:高</option>
                        <option value='MEDIUM'>優先度:中</option>
                        <option value='LOW'>優先度:低</option>
                    </select>
                    {errors.priority && <span className="text-red-500 text-xs">{errors.priority.message}</span>}
                </div>

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