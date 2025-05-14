import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import todoRoutes from './routes/todoRoutes';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import helmet from 'helmet';
import { connectDB } from './db'; // 明示的に呼び出す
import session from 'express-session';
import passport from './passport';  // passport設定
import dotenv from 'dotenv';  // dotenvをインポート
import authRoutes from './routes/authRoutes';  // 認証ルート
import flash from 'connect-flash';
import { ensureAuthenticated, errorHandler, setUserToLocals } from './middlewares/middlewares';
import { log } from 'console';
// import './gitHub'; 


const port = 3000;

dotenv.config();  // .env ファイルを読み込む


// DB接続を明示的に実行
connectDB();

// サーバの立ち上げ
const app = express();

// EJSをビューエンジンとして設定
app.set('view engine', 'ejs');
// viewsディレクトリの場所を指定
app.set('views', path.join(__dirname, 'views'));
// `express-ejs-layouts`を使用する設定
app.use(expressLayouts); 

// レイアウトのパスを指定
app.set('layout', 'layouts/layout'); // レイアウトファイルのパスを指定



// .envから環境変数を読み込む
const isProduction = process.env.NODE_ENV === 'production'
console.log('isProduction', isProduction);


app.set('trust proxy', 1);  // 1つのプロキシサーバーを信頼する



// セッションので設定
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',  // .envからシークレットを読み込む
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // セッションの有効期限（例：2時間）
        secure: isProduction,       // 本番環境では secure: true に設定（HTTPSを強制）
        httpOnly: true,             // クライアントサイドのJavaScriptからアクセスできないように
        // sameSite: 'strict'          // クロスサイトリクエストでのCookie送信を制限
        sameSite: 'lax' // 'strict'から'lax'に変更することでリダイレクト時のCookie送信を許可
      }
}));



// 認証の設定
app.use(passport.initialize());
app.use(passport.session());



// 静的ディレクトリの設定
app.use(express.static('public'));
// formからデータを受け取る設定
app.use(express.urlencoded({extended:true}));
// helmetミドルウェアを使って基本的なセキュリティヘッダーを追加
app.use(helmet());
// flash メッセージを使う設定
app.use(flash());




// ユーザ情報をviewに渡すミドルウェア
app.use(setUserToLocals);


// ルーティングの呼び出し 
app.get('/', (req, res) => {
    return res.redirect('/auth/login');  // 認証失敗時トップページにリダイレクト
});
app.use('/task', ensureAuthenticated,todoRoutes);
app.use('/auth',authRoutes); 


// エラーハンドリングミドルウェア
app.use(errorHandler);


const server = http.createServer(app);

// ⏱ 10秒（10000ミリ秒）でタイムアウト
server.setTimeout(10000); 

// サーバー起動
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});