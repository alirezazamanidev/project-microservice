export const sessionConfig = {
  secret: process.env.SESSION_SECRET_KEY ,
  resave: false,
  
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days in milliseconds
    sameSite: 'lax' as const, // CSRF protection,
    domain: process.env.NODE_ENV === 'production' ? 'localhost' : 'localhost',
    path: '/',
  },
};
