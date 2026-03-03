import { IAuthUser } from "./index.ts";

// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}

export {};
