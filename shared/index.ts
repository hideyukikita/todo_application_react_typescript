import { z } from 'zod';

// ---todoスキーマ---
export const todoSchema = z.object({
    title: z
        .string()
        .min(1, 'タイトルを入力してください')
        .max(50, 'タイトルは50文字以内で入力してください'),
    memo: z
        .string()
        .max(200, 'メモは200文字以内で入力してください')
        .optional()
        .or(z.literal('')), //空文字も許容
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).refine(val => !!val, {
        message: '優先度を選択してください'
    }),
    deadline: z
        .string()
        .min(1, '締切日を入力してください'),
    is_completed: z.boolean().optional(),
});

// 型の抽出
export type TodoInput = z.infer<typeof todoSchema>;

//---Auth(サインアップ)スキーマ---
export const signupSchema = z.object({
    name: z.string().min(1, '名前を入力してください。'),
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
});

export type SignupInput = z.infer<typeof signupSchema>;


// --Auth(ログイン)スキーマ---
export const loginSchema = z.object({
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
});

export type LoginInput = z.infer<typeof loginSchema>;