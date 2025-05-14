// src/types/express/index.d.ts

declare module global {
    namespace Express {
        interface Request {
            login(user: any, callback: (err?: any) => void): void;
        }
    }
}
