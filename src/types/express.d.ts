declare global {
  namespace Express {
    interface Request {
      user?: {
        sub?: string;
        role?: string;
        email?: string;
        username?: string;
      };
    }
  }
}

export {};
