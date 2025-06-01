export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  CONFLICT = 'CONFLICT_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

export enum ErrorModule {
  USER = 'USER_MODULE',
  AUTH = 'AUTH_MODULE',
  DATABASE = 'DATABASE_MODULE',
  VALIDATION = 'VALIDATION_MODULE',
  SYSTEM = 'SYSTEM_MODULE',
  CACHE = 'CACHE_MODULE',
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

type ErrorMessagesType = {
  [K in ErrorModule]: {
    [T in ErrorType]?: {
      [key: string]: string;
    };
  };
};

export const ErrorMessages: ErrorMessagesType = {
  [ErrorModule.USER]: {
    [ErrorType.NOT_FOUND]: {
      USER_NOT_FOUND: 'User not found',
    },
    [ErrorType.VALIDATION]: {
      INVALID_EMAIL: 'Please provide a valid email',
      INVALID_PASSWORD: 'Password must be at least 6 characters long',
    },
    [ErrorType.CONFLICT]: {
      DUPLICATE_EMAIL: 'Email already exists',
    },
  },
  [ErrorModule.AUTH]: {
    [ErrorType.AUTHENTICATION]: {
      INVALID_TOKEN: 'Invalid token. Please log in again',
      TOKEN_EXPIRED: 'Token expired. Please log in again',
      INVALID_CREDENTIALS: 'Invalid credentials',
    },
    [ErrorType.AUTHORIZATION]: {
      UNAUTHORIZED: 'You are not authorized to perform this action',
      FORBIDDEN: 'Access forbidden',
    },
  },
  [ErrorModule.DATABASE]: {
    [ErrorType.INTERNAL]: {
      CONNECTION_ERROR: 'Database connection failed',
      QUERY_ERROR: 'Database query failed',
    },
    [ErrorType.VALIDATION]: {
      INVALID_DATA: 'Invalid data format',
    },
    [ErrorType.NOT_FOUND]: {
      RESOURCE_NOT_FOUND: 'Resource not found',
    },
  },
  [ErrorModule.VALIDATION]: {
    [ErrorType.VALIDATION]: {
      INVALID_INPUT: 'Invalid input data',
      MISSING_FIELDS: 'Required fields are missing',
    },
  },
  [ErrorModule.SYSTEM]: {
    [ErrorType.INTERNAL]: {
      SERVER_ERROR: 'Something went wrong',
      UNKNOWN_ERROR: 'An unknown error occurred',
    },
    [ErrorType.AUTHORIZATION]: {
      RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
    },
    [ErrorType.VALIDATION]: {
      INVALID_CONFIG: 'Invalid configuration',
    },
  },
  [ErrorModule.CACHE]: {
    [ErrorType.INTERNAL]: {
      SET_ERROR: 'Failed to set cache value',
      GET_ERROR: 'Failed to get cache value',
      DELETE_ERROR: 'Failed to delete cache value',
      FLUSH_ERROR: 'Failed to flush cache',
    },
  },
};
