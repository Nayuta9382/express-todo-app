export type User = {
    id: number;              // ユーザーID（自動増分）
    name: string;            // ユーザー名
    password: string;        // ハッシュ化されたパスワード
    created_at: Date;        // 作成日時
    updated_at: Date;        // 更新日時
}