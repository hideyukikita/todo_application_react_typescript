// frontend/src/pages/AuthPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { loginSchema, signupSchema} from '../../../shared';
import type { LoginInput, SignupInput } from '../../../shared';
import { LogIn, UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // ログインと新規登録の切り替え
  const { login, signup } = useAuth();
  
  // フォーム用ステート
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ログイン用フォーム設定
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''}
  });

  // 新規登録用フォーム設定
  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {name: '', email: '', password: ''}
  });

  // 送信処理(共通)
  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // dataはLoginInput型
        await login(data.email, data.password);
      } else {
        // dataはSignupInput型
        await signup(data.name, data.email, data.password);
        // 新規登録後は自動でログイン画面モードに切り替えるか、
        // またはそのままログイン処理を走らせる（今回はシンプルにログインへ誘導）
        alert('登録が完了しました。ログインしてください。');
        signupForm.reset();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '認証に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // formStateのみ取得
  const { handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = loginForm;
  const { handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = signupForm;

  // 2. 現在のモードに応じたエラーと送信関数を判定
  const currentErrors = isLogin ? loginErrors : signupErrors;
  const currentHandleSubmit = isLogin ? handleLoginSubmit : handleSignupSubmit;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'ToDoアプリにログインしてください' : '必要事項を入力して登録してください'}
          </p>
        </div>
        
        {/* handleSubmit(onSubmit)でZodバリデーションを実行 */}
        <form onSubmit={currentHandleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  // registerをどちらのフォームから呼ぶか明示
                  {...signupForm.register('name')}
                  type="text"
                  placeholder="お名前"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${signupForm.formState.errors.name ? 'border-red-500' : 'focus:ring-blue-500'}`}
                />
              </div>
              {signupForm.formState.errors.name && (
                <span className="text-red-500 text-xs">{signupForm.formState.errors.name.message}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...(isLogin ? loginForm.register('email') : signupForm.register('email'))}
                type='email'
                placeholder="メールアドレス"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            {currentErrors.email && (
              <span className="text-red-500 text-xs">{currentErrors.email.message}</span>
            )}
          </div>
          

          <div className="flex flex-col gap-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...(isLogin ? loginForm.register('password') : signupForm.register('password'))}
                type="password"
                placeholder="パスワード"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${currentErrors.password ? 'border-red-500' : 'focus:ring-blue-500'}`}
              />
            </div>
            {currentErrors.password && (
              <span className="text-red-500 text-xs">{currentErrors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-blue-300"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isLogin ? (
              <><LogIn className="mr-2 w-5 h-5" /> ログイン</>
            ) : (
              <><UserPlus className="mr-2 w-5 h-5" /> アカウント作成</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              loginForm.reset();
              signupForm.reset();
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
};