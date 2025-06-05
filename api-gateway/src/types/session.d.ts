import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      userId: string;
      email: string;
      isAuthenticated: boolean;
      loginTime: Date;
    };
  }
}
