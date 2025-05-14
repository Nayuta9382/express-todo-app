import { SessionData } from 'express-session';

declare module 'express-session' {
    interface Session {
        errors?:  Record<string, string[]>;   // エラーメッセージを格納するためのプロパティ
        oldInput?: object; // フォームデータを格納するためのプロパティ
        userId?:string;
    }
}