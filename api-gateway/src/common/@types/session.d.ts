import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
     
      email: string;
      picture?: string;
      fullname?: string;
     
    };
  }
}
