export type Task = {
    id: number;   
    user_id : string           // ユーザーID（自動増分）
    title: string;            // ユーザー名
    detail: string ;       // プロフィール画像のパス
    deadline: Date;   
    del_flg : 0 | 1;
    created_at: Date;        // 作成日時
}
