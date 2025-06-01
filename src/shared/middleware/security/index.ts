import { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { defaultRateLimiter } from '../rate-limit.middleware';
import { config } from '../../../config';
import * as security from  "../../../modules/security/index"

export const configureSecurityMiddleware = (app: Application): void => {
  // Basic security headers
  app.use(helmet());
  app.use(cors());

  // Rate limiting
  app.use(defaultRateLimiter);

  // CSRF protection (disabled in test environment)
  if (config.env !== 'test') {
    app.use(security.csrfProtection.generateToken);
    app.use(security.csrfProtection.verifyToken);
  }

  // Injection protections
  app.use(security.sqlInjectionProtection);
  app.use(security.nosqlInjectionProtection);
  app.use(security.commandInjectionProtection);

  // SSRF protection
  app.use(security.ssrfProtection);

  // Prototype pollution protection
  app.use(security.prototypePollutionProtection);
};
