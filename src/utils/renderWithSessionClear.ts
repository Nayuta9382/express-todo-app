import { Request, Response } from 'express';

// バリデーションエラーメッセージを持ってビューをレンダリングする関数(セッションを破棄する)
export const renderWithSessionClear = (req: Request,res: Response,viewPath: string ,customItem?:Record<string, string | null | object>) => {
    const errors = req.session?.errors || {};
    const oldInput = req.session?.oldInput || {};
    // ビューをレンダリング
    console.log("return前");
    
    if(customItem){
        console.log("rendaer");
        
        res.render(viewPath, { errors, oldInput ,customItem});
        console.log({ errors, oldInput ,customItem});
        
    }else{
        res.render(viewPath, { errors, oldInput });
    }

    // セッション上の一時データを削除
    delete req.session.errors;
    delete req.session.oldInput;
};