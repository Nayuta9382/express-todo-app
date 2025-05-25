import { Pool } from 'pg';
import dotenv from 'dotenv';  // dotenvをインポート

// .envを読み込む
dotenv.config();


const db: Pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    max: 15,
    idleTimeoutMillis: 30000 // 30秒接続なして遮断
});
// 接続関数を明示的に呼び出す用に定義
export const connectDB = async () => {
    try {
        const client = await db.connect();
        console.log('PostgreSQL に接続しました');
        client.release(); // 必ず解放
    } catch (err) {
        console.error('PostgreSQL への接続に失敗しました: ', err);
    }
};

export default db;
