import type { Request } from 'express-serve-static-core';

export interface AuthUser {
  sub?: string;
  role?: string;
  email?: string;
  username?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export {};
