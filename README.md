# Express.js Backend Boilerplate

A complete Express.js backend boilerplate with TypeScript, featuring a modular architecture, authentication, validation, and error handling.

## Features

- 🚀 TypeScript support
- 📦 Modular architecture
- 🔐 JWT Authentication
- ✅ Request validation
- 🎯 Error handling
- 📝 API documentation
- 🔍 Environment configuration
- 🧪 Testing setup
- 🔄 Database integration (MongoDB)
- 🔒 Security middleware

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database connection configuration
│   ├── env.ts        # Environment variables configuration
│   └── logger.ts     # Logging configuration
│
├── modules/          # Feature modules (each module is self-contained)
│   └── users/        # User module example
│       ├── controllers/  # Request handlers and business logic
│       ├── models/       # Database models and schemas
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic and data operations
│       └── validations/  # Request validation schemas
│
├── shared/           # Shared utilities and middleware
│   ├── middleware/   # Global middleware (auth, error handling, etc.)
│   └── utils/        # Helper functions and utilities
│
├── app.ts           # Express app setup and middleware configuration
└── server.ts        # Server entry point and startup logic
```

### Directory Structure Details

- **config/**: Contains all configuration files for the application
  - `database.ts`: MongoDB connection setup and configuration
  - `env.ts`: Environment variables validation and configuration
  - `logger.ts`: Logging setup and configuration

- **modules/**: Contains feature-specific modules, each following a modular architecture
  - Each module (e.g., users) contains:
    - `controllers/`: Handles HTTP requests and responses
    - `models/`: Defines database schemas and models
    - `routes/`: Defines API endpoints and routes
    - `services/`: Contains business logic and data operations
    - `validations/`: Request validation schemas and rules

- **shared/**: Contains code shared across multiple modules
  - `middleware/`: Global middleware functions
    - Authentication middleware
    - Error handling middleware
    - Request logging middleware
    - CORS and security middleware
  - `utils/`: Reusable utility functions and helpers
    - Date formatting
    - String manipulation
    - Common validations
    - Error handling utilities

- **app.ts**: Main application setup
  - Express app initialization
  - Global middleware configuration
  - Route registration
  - Error handling setup

- **server.ts**: Server entry point
  - Environment configuration
  - Database connection
  - Server startup logic
  - Graceful shutdown handling

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd expressjs-backend-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

## API Endpoints

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PATCH /api/users/profile` - Update user profile (protected)
- `DELETE /api/users/profile` - Delete user profile (protected)

## Adding New Modules

1. Create a new directory in `src/modules/`
2. Follow the structure:
   ```
   module-name/
   ├── controllers/
   ├── models/
   ├── routes/
   ├── services/
   └── validations/
   ```
3. Implement your module components
4. Add routes to `app.ts`

## Error Handling

The application uses a centralized error handling mechanism. All errors are processed through the error handling middleware in `app.ts`.

## Authentication

JWT-based authentication is implemented. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
