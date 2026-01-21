////////////////////////////////////////////
// メイン画面
////////////////////////////////////////////

import { useState } from 'react';
import { useTodos, useUpdateTodo, useDeleteTodo } from './hooks/useTodos'
import type { Todo } from './hooks/useTodos' 
import { CheckCircle2, Circle, Clock, AlertCircle, Trash2, Pencil } from 'lucide-react'
import { TodoForm } from './components/TodoForm';


function App() {
  // カスタムフックから「データ」「ロード状態」「エラー状態」を取り出す
  const { data: todos, isLoading, isError } = useTodos();

  // 更新機能の準備
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  
  //現在編集中のタスクを管理(nullならモーダル非表示)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // 完了・未完了を切り替える関数
  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      updates: { 
        ...todo,
        is_completed: !todo.is_completed }
    });
  };

  // 削除実行関数
  const handleDelete = (id: string) => {
    if (window.confirm(`このタスクを削除しますか?`)) {
      deleteTodoMutation.mutate(id);
    }
  };

  // 1. ロード中の表示
  if(isLoading){
    return(
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'/>
      </div>
    );
  }

  // 2. エラー発生時の表示
  if(isError){
    return(
      <div className='flex items-center justify-center min-h-screen bg-gray-50 text-red-500'>
        <AlertCircle className='mr-2'/>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8 relative'>
      {/* 編集モーダル:editingTodoがある時だけ表示 */}
      {editingTodo && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='max-w-2xl w-full animate-in fade-in zoom-in duration-200'>
          {/* onCloseでeditingTodoをnullにすればモーダルが閉じる */}
          <TodoForm editTodo={editingTodo} onClose={() => setEditingTodo(null)} />
          </div>
        </div>
      )}
    

      <div className='max-w-4xl mx-auto'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>My Todo List</h1>
          <p className='text-gray-600'>Phase1: 高機能CRUD実装</p>
        </header>

        {/* 新規登録フォーム */}
        <TodoForm />

        {/* Todoリスト本体 */}
        <div className='space-y-4'>
          {todos?.length === 0 ? (
            <p className='text-center text-gray-500 py-10'>タスクがありません。</p>
          ): (
            todos?.map((todo) => (
              <div
                key={todo.id}
                className='bg-white  p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow'
                >
                  <div className='flex items-center space-x-4'>
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      className='focus:outline-none hover:scale-110 transition-transform active:scale-95'
                      disabled={updateTodoMutation.isPending}
                      >
                      {/* 完了状態アイコン */}
                      {todo.is_completed ? (
                        <CheckCircle2 className='text-green-500 w-6 h-6' />
                      ) : (
                        <Circle className='text-gray-300 w-6 h-6' />
                      )}
                    </button>

                      <div>
                        <h3 className={`font-semibold ${todo.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {todo.title}
                        </h3>
                        <p className='text-sm text-gray-500'>{todo.memo}</p>
                      </div>
                    </div>

                  <div className='flex items-center space-x-4 text-sm text-gray-500'>
                    {/* 優先度バッジ */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      todo.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                      todo.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {todo.priority}
                    </span>
                    {/* 締切日 */}
                    <div className='flex items-center'>
                      <Clock className='w-4 h-4 mr-1' />
                      {todo.deadline}
                    </div>
                    {/* 編集ボタン */}
                    <button
                      onClick={() => {setEditingTodo(todo)}}
                      className='text-gray-400 hover:text-blue-600 transition-colors p-1'
                    >
                      <Pencil className='w-5 h-5'/>
                    </button>
                    {/* 削除ボタン */}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className='text-gray-400 hover:text-red-500 transition-colors p-1'
                      disabled={deleteTodoMutation.isPending}
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App