import { Request, Response } from 'express';

export const renderWithSessionClear = (req: Request,res: Response,viewPath: string) => {
    const errors = req.session?.errors || {};
    const oldInput = req.session?.oldInput || {};

    // ビューをレンダリング
    res.render(viewPath, { errors, oldInput });

    // セッション上の一時データを削除
    delete req.session.errors;
    delete req.session.oldInput;
};