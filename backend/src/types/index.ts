// types/index.ts
export interface IUser {
  id: string;
  username: string;
  email: string;
}

export interface IAuthUser extends IUser {
  createdAt: Date;
}

export interface IJwtUserPayload extends IUser {
  iat: number;
  exp: number;
}