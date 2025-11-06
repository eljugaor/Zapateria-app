import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

// JWT Authentication Middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const publicPaths = ['/api/login', '/api/register'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// CSRF Protection: use session-based tokens (don't set cookie:true)
export const csrfProtection = csrf({
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req: Request) => {
    // Prefer header, fallback to body param _csrf
    return (req.headers['csrf-token'] as string) || (req.headers['x-csrf-token'] as string) || req.body?._csrf;
  }
});

// Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
});

// Rate Limiting
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intente más tarde' }
});

// Input Sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '')
          .replace(/'/g, "''")
          .trim();
      }
    });
  }
  next();
};

// CSRF Error Handler
export const handleCsrfError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ error: 'CSRF token inválido' });
};

