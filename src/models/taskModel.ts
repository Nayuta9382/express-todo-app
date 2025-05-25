import { QueryResult } from 'pg';
import db from '../db'; // DB接続をインポート
import { Task } from '../types/task';

// タスクの全件取得(削除されていない)
export const getTaskAll = async (id: string, searchText: string, sort: string, delFlg: number): Promise<Task[]> => {
  try {
    const orderBy = sort === 'asc' ? 'ORDER BY deadline ASC' : 'ORDER BY deadline DESC';
    // ワイルドカード文字をエスケープ
    const escapedSearchText = searchText.replace(/([%_\\])/g, '\\$1');
    const sql = `SELECT id, user_id, title, detail, TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline FROM tasks WHERE user_id = $1 AND del_flg = $2 AND title ILIKE $3 ESCAPE '\\' ${orderBy} `;
    const delFlgBoolean = delFlg === 1 ? true : false;
    const result: QueryResult = await db.query(sql, [id, delFlgBoolean, `%${escapedSearchText}%`]);
    return result.rows;
  } catch (err) {
    console.error(err);
    const error = new Error() as any;
    error.status = 500;
    throw error;
  }
};

// id検索によるタスク情報取得
export const selectTaskById = async (id: number): Promise<Task | null> => {
    try {
        const result = await db.query('SELECT id, user_id, title, detail, del_flg, TO_CHAR(deadline, \'YYYY-MM-DD\') AS deadline FROM tasks WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as any;
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}


// id複数検索によるタスク情報取得
export const selectTasksByIds = async (ids: number[]): Promise<Task[] | null> => {
    try {
        if (ids.length === 0) return null;
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const query = `SELECT * FROM tasks WHERE id IN (${placeholders})`;
        const result = await db.query(query, ids);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows as any[];
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}




// タスクの新規登録
export const addTask = async (userId: string, title: string, detail: string, deadline: Date) => {
    try {
        await db.query('INSERT INTO tasks(user_id, title, detail, deadline) VALUES($1, $2, $3, $4)', [userId, title, detail, deadline]);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}


// タスクの更新処理
export const updateTask = async (id: number, title: string, detail: string, deadline: Date) => {
    try {
        await db.query('UPDATE tasks SET title = $1, detail = $2, deadline = $3 WHERE id = $4', [title, detail, deadline, id]);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}


// タスクの削除処理(複数一括)
export const deleteTask = async (ids: number[]) => {
    try {
        if (ids.length === 0) return;
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const query = `UPDATE tasks SET del_flg = true WHERE id IN (${placeholders})`;
        await db.query(query, ids);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}



// タスクの削除取り消し処理(複数一括)
export const restoreTask = async (ids: number[]) => {
    try {
        if (ids.length === 0) return;
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const query = `UPDATE tasks SET del_flg = false WHERE id IN (${placeholders})`;
        await db.query(query, ids);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
}

