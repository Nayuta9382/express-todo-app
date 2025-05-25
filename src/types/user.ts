export type User = {
    id: string;              // ユーザーID（自動増分）
    name: string;            // ユーザー名
    img_path: string         // プロフィール画像のパス
    password: string;        // ハッシュ化されたパスワード
    created_at: Date;        // 作成日時
    updated_at: Date;        // 更新日時
}