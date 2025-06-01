export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL_ERROR',
  DATABASE = 'DATABASE',
  EMAIL = 'EMAIL_ERROR',
  REDIS = 'REDIS_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SECURITY = 'SECURITY_ERROR',
  INJECTION = 'INJECTION_ERROR',
  SSRF = 'SSRF_ERROR',
  CSRF = 'CSRF_ERROR',
}

export enum ErrorModule {
  USER = 'USER',
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  SYSTEM = 'SYSTEM',
  EMAIL = 'EMAIL',
  REDIS = 'REDIS',
  SECURITY = 'SECURITY',
}

export interface ErrorSource {
  module: ErrorModule;
  service?: string;
  method?: string;
}

export interface ErrorResponse {
  type: ErrorType;
  module: ErrorModule;
  message: string;
  statusCode: number;
  source?: ErrorSource;
  details?: Record<string, unknown>;
}

export type ErrorMessagesType = {
  [key in ErrorModule]: {
    [key in ErrorType]?: {
      [key: string]: string;
    };
  };
};

export const ErrorMessages: ErrorMessagesType = {
  [ErrorModule.USER]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid user input',
      DUPLICATE_EMAIL: 'Email already exists',
    },
    [ErrorType.AUTHENTICATION]: {
      INVALID_CREDENTIALS: 'Invalid email or password',
    },
    [ErrorType.AUTHORIZATION]: {
      UNAUTHORIZED: 'You are not authorized to perform this action',
    },
    [ErrorType.NOT_FOUND]: {
      USER_NOT_FOUND: 'User not found',
    },
    [ErrorType.CONFLICT]: {
      USER_EXISTS: 'User with this email already exists',
    },
    [ErrorType.INTERNAL]: {
      CREATE_ERROR: 'Error creating user',
      UPDATE_ERROR: 'Error updating user',
      DELETE_ERROR: 'Error deleting user',
      QUERY_ERROR: 'Error querying user',
      PASSWORD_HASH_ERROR: 'Error hashing password',
      PASSWORD_COMPARE_ERROR: 'Error comparing passwords',
    },
  },
  [ErrorModule.AUTH]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid authentication input',
    },
    [ErrorType.AUTHENTICATION]: {
      NO_TOKEN: 'No authentication token provided',
      INVALID_TOKEN: 'Invalid authentication token',
      TOKEN_EXPIRED: 'Authentication token has expired',
      INVALID_CREDENTIALS: 'Invalid email or password',
    },
    [ErrorType.AUTHORIZATION]: {
      UNAUTHORIZED: 'You are not authorized to perform this action',
    },
    [ErrorType.NOT_FOUND]: {
      USER_NOT_FOUND: 'User not found',
    },
    [ErrorType.CONFLICT]: {
      USER_EXISTS: 'User with this email already exists',
    },
    [ErrorType.INTERNAL]: {
      LOGIN_ERROR: 'Error during login',
      TOKEN_GENERATION_ERROR: 'Error generating authentication token',
    },
  },
  [ErrorModule.DATABASE]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid database input',
      INVALID_DATA: 'Invalid data format',
    },
    [ErrorType.AUTHENTICATION]: {
      INVALID_CREDENTIALS: 'Invalid database credentials',
    },
    [ErrorType.AUTHORIZATION]: {
      UNAUTHORIZED: 'You are not authorized to access the database',
    },
    [ErrorType.NOT_FOUND]: {
      RESOURCE_NOT_FOUND: 'Resource not found',
      RECORD_NOT_FOUND: 'Record not found',
    },
    [ErrorType.CONFLICT]: {
      DUPLICATE_KEY: 'Duplicate key error',
      DUPLICATE_EMAIL: 'Email already exists',
    },
    [ErrorType.INTERNAL]: {
      QUERY_ERROR: 'Database query error',
      CONNECTION_ERROR: 'Database connection error',
      DISCONNECTION_FAILED: 'Failed to disconnect from database',
    },
  },
  [ErrorModule.VALIDATION]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid input data',
    },
    [ErrorType.AUTHENTICATION]: {
      INVALID_CREDENTIALS: 'Invalid credentials',
    },
    [ErrorType.AUTHORIZATION]: {
      UNAUTHORIZED: 'You are not authorized to perform this action',
    },
    [ErrorType.NOT_FOUND]: {
      NOT_FOUND: 'Resource not found',
    },
    [ErrorType.CONFLICT]: {
      CONFLICT: 'Resource conflict',
    },
    [ErrorType.INTERNAL]: {
      INTERNAL_ERROR: 'Internal validation error',
    },
  },
  [ErrorModule.SYSTEM]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid input data',
      INVALID_CONFIG: 'Invalid configuration',
    },
    [ErrorType.INTERNAL]: {
      SERVER_ERROR: 'Internal server error',
    },
    [ErrorType.TOO_MANY_REQUESTS]: {
      RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
    },
  },
  [ErrorModule.EMAIL]: {
    [ErrorType.EMAIL]: {
      SEND_ERROR: 'Error sending email',
      TEMPLATE_ERROR: 'Error with email template',
    },
  },
  [ErrorModule.REDIS]: {
    [ErrorType.REDIS]: {
      CONNECTION_ERROR: 'Redis connection error',
      OPERATION_ERROR: 'Redis operation error',
    },
  },
  [ErrorModule.SECURITY]: {
    [ErrorType.SECURITY]: {
      INVALID_URL: 'Invalid URL detected',
      INJECTION_DETECTED: 'Injection attempt detected',
      SSRF_DETECTED: 'SSRF attempt detected',
      PROTOTYPE_POLLUTION: 'Prototype pollution detected',
    },
    [ErrorType.INJECTION]: {
      SQL_INJECTION: 'SQL injection attempt detected',
      NOSQL_INJECTION: 'NoSQL injection attempt detected',
      COMMAND_INJECTION: 'Command injection attempt detected',
    },
    [ErrorType.SSRF]: {
      INVALID_URL_PARAM: 'Invalid URL parameter',
      INVALID_QUERY_URL: 'Invalid URL in query parameter',
      INVALID_BODY_URL: 'Invalid URL in request body',
    },
    [ErrorType.CSRF]: {
      TOKEN_MISSING: 'CSRF token missing',
      TOKEN_INVALID: 'Invalid CSRF token',
      TOKEN_EXPIRED: 'CSRF token expired',
    },
  },
};
