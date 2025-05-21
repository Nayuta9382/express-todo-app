import { User } from "../user";

// src/types/express/index.d.ts
declare global {
    namespace Express {
        interface Request {
            login(user: User, done: (err: any) => void): void;
            logout(callback: (err?: any) => void): void;
            user?: User; // または User 型を指定しても OK
        }
    }
}
