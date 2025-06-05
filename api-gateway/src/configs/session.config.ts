export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days in milliseconds
    sameSite: 'lax', // CSRF protection,
    domain: process.env.NODE_ENV === 'production' ? 'localhost' : 'localhost',
    path: '/',
  },
  name: 'sessionId', // Custom session cookie name
};
