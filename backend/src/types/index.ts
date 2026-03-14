export interface IUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface IJwtUserPayload {
  id: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}
