import express, { Request, Response, NextFunction } from 'express';
import todoRoutes from './routes/todoRoutes';
import path from 'path';
import helmet from 'helmet';
import { connectDB } from './db'; // 明示的に呼び出す
import session from 'express-session';
import passport from './passport';  // passport設定
import dotenv from 'dotenv';  // dotenvをインポート
import authRoutes from './routes/authRoutes';  // 認証ルート
import flash from 'connect-flash';


const port = 3000;

dotenv.config();  // .env ファイルを読み込む


// DB接続を明示的に実行
connectDB();

// サーバの立ち上げ
const app = express();

// セッションので設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',  // .envからシークレットを読み込む
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // セッションの有効期限（例：2時間）
  }
}));

// 認証の設定
app.use(passport.initialize());
app.use(passport.session());

// EJSをビューエンジンとして設定
app.set('view engine', 'ejs');
// viewsディレクトリの場所を指定
app.set('views', path.join(__dirname, 'views'));
// 静的ディレクトリの設定
app.use(express.static('public'));
// formからデータを受け取る設定
app.use(express.urlencoded({extended:true}));
// helmetミドルウェアを使って基本的なセキュリティヘッダーを追加
app.use(helmet());
// flash メッセージを使う設定
app.use(flash());


// ルーティングの呼び出し 
app.get('/', (req, res) => {
  return res.redirect('/auth/login');  // 認証失敗時トップページにリダイレクト
});
app.use('/task',todoRoutes);
app.use('/auth', authRoutes); 



// エラーハンドリングミドルウェア
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status === 404) {
    // 404 エラー処理
    res.status(404).json({
      message: 'The requested resource was not found',
      error: err.message,
    });
  } else {
    // その他のエラー（500 エラー処理）
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message || 'Unknown error occurred',
    });
  }
});


// サーバー起動
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });