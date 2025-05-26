import cors from 'cors';
import { Application } from 'express';
import { envConfig } from '../config/envConfig';

const corsOptions = {
  origin: [envConfig.clientUrl, envConfig.clientUrl2], // Array for multiple origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Length', 'X-Powered-By', 'Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
};

export const configureCors = (app: Application) => {
  app.use(cors(corsOptions));
};
