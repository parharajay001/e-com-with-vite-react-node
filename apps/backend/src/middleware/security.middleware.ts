import compression from 'compression';
// import csurf from 'csurf';
import { Application } from 'express';
import helmet from 'helmet';
import { configureCors } from './cors.middleware';
import { apiLimiter } from './rateLimiter.middleware';

export const configureSecurityMiddleware = (app: Application) => {
  // Enable CORS with options
  configureCors(app);

  // Add security headers
  // Configure security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'"], // Adjust based on requirements
        },
      },
      crossOriginEmbedderPolicy: true,
    }),
  );

  // Enable gzip compression
  app.use(compression());

  // Add CSRF protection
  // app.use(
  //   csurf({
  //     cookie: {
  //       secure: envConfig.nodeEnv === 'production',
  //       sameSite: 'strict',
  //       httpOnly: true,
  //     },
  //   }),
  // );

  // Rate limiting
  app.use(apiLimiter);

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
};
