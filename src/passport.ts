import passport, { Profile } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { insertUser, userSelectById } from './models/userModel';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import path from 'path';

// ローカル戦略の設定
passport.use(new LocalStrategy(
    {
        usernameField: 'id',       // ここでフォームで送信されるフィールド名を指定
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req: Request, id: string, password: string, done: (err: any, user?: any, info?: any) => void) => {
        try {
            // データベースからユーザー情報を取得
            const rows = await userSelectById(id);
            const user = rows ? rows : null;

            // ユーザーが存在しない場合
            if (!user) {
                return done(null, false, { message: 'idとパスワードが一致しません' });
            }

            // パスワードが一致するかどうか
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'idとパスワードが一致しません' });
            }

            return done(null, user);  // 認証成功
        } catch (err) {
            return done(err);  // エラー処理
        }
    }
));


// GitHub OAuth Strategyの設定
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!,
    passReqToCallback: true,
}, async (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    const { id, displayName } = profile;
    const githubAvatar = profile.photos?.[0]?.value || '/uploads/default-img.png';


    try {
        let user = await userSelectById(`github_${id}`);
        if (!user) {
            
            await insertUser(`github_${id}`, displayName || 'No name', '',githubAvatar);
            user = await userSelectById(`github_${id}`);
        }

        return done(null, user || false);

    } catch (error) {
        return done(error);
    }
}));

// ユーザー情報をセッションに保存する処理
    passport.serializeUser((user: any, done) => {
        done(null, (user as any).id);  
    });

// セッションIDからユーザー情報を復元する処理
passport.deserializeUser(async (id: string, done) => {
    try {
        const rows = await userSelectById(id);
        const user = rows ? rows : null;

        if (!user) {
            return done(null, false);  // ユーザーが見つからなかった場合
        }
        // gitHubアカウントならならそのまま使う
        if (user.img_path.startsWith('http://') || user.img_path.startsWith('https://')) {
            return done(null, user);
        }

        // ローカルに画像がない場合デフォルト画像を表示
        const safeFilename = path.basename(user.img_path || '');
        const uploadDir = path.join(__dirname, '../public/uploads/');
        const profileImagePath = path.join(uploadDir, safeFilename);
        console.log(profileImagePath);
        
        
        try {
            await fs.promises.access(profileImagePath, fs.constants.F_OK);
        } catch {
            user.img_path = '/uploads/default-img.png';
        }

        done(null, user);  // ユーザー情報を復元
    } catch (err) {
        done(err);  // エラー処理
    }
});

export default passport;
