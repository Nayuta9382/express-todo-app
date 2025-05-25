import express from 'express';
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
import rateLimit from 'express-rate-limit';



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
// 静的ファイルの設定
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.ico')));
// 静的ディレクトリの設定
app.use(express.static('public'));

// レイアウトのパスを指定
app.set('layout', 'layouts/layout'); // レイアウトファイルのパスを指定



// .envから環境変数を読み込む
const isProduction = process.env.NODE_ENV === 'production'
console.log(isProduction ? '本番環境の設定です' : '開発環境の設定です');


app.set('trust proxy', 1);  // 1つのプロキシサーバーを信頼する


// Dos対策の設定
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1分
    max: 200,            
    standardHeaders: true, // レスポンスヘッダに制限情報を含める
    legacyHeaders: false, // 古いレート制限ヘッダーを無効化
    handler: (req, res) => {
    // 429ステータスでEJSのrate-limitページをレンダリング
    res.status(429).render('error/rate-limit');
    }
});

app.use(generalLimiter);

// セッションので設定
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',  // .envからシークレットを読み込む
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // セッションの有効期限（例：2時間）
        secure: isProduction,       // 本番環境では secure: true に設定（HTTPSを強制）
        httpOnly: true,             // クライアントサイドのJavaScriptからアクセスできないように
        sameSite: 'lax' // 'strict'から'lax'に変更することでリダイレクト時のCookie送信を許可
      }
}));



// 認証の設定
app.use(passport.initialize());
app.use(passport.session());



// formからデータを受け取る設定
app.use(express.urlencoded({extended:true}));



// helmetミドルウェアを使って基本的なセキュリティヘッダーを追加
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],  // CDNドメインを追加
        styleSrc: ["'self'", "https://cdn.jsdelivr.net"],   // CDNドメインを追加
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],    // フォント読み込み用に追加
        imgSrc: ["'self'", "data:","https://avatars.githubusercontent.com"], // ← GitHubのアバター画像用に追加],                        // 画像でdata URIも許可（Bootstrapのアイコンなど）
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
      }
    }
  })
);
// flash メッセージを使う設定
app.use(flash());




// ユーザ情報をviewに渡すミドルウェア
app.use(setUserToLocals);


// ルーティングの呼び出し 
app.get('/', async (req, res, next) => {
    try {
        return res.redirect('/auth/login');
    } catch (err) {
        next(err); // エラーハンドリングミドルウェアへ
    }
});

// 認証が必要なタスク関連ルート
app.use('/task', async (req, res, next) => {
    try {
        await ensureAuthenticated(req, res, next);
    } catch (err) {
        next(err);
    }
}, todoRoutes);

// 認証関連ルート
app.use('/auth', async (req, res, next) => {
    try {
        await authRoutes(req, res, next);
    } catch (err) {
        next(err);
    }
});

// 404ルーティング
app.use((req, res, next) => {
    const error = new Error() as any;
    error.status = 404;
    next(error); // errorHandler に渡す
});


// エラーハンドリングミドルウェア
app.use(errorHandler);


const server = http.createServer(app);

// ⏱ 60秒（60000ミリ秒）でタイムアウト
server.setTimeout(60000); 

// サーバー起動
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Server is running on https://${HOST}:${PORT}`);
});