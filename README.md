# User Management APIs

A Node.js Express API server built with TypeScript for user management.

## Features

- 🚀 Express.js with TypeScript
- 🛡️ Security middleware (Helmet, CORS)
- 📊 Request logging with Morgan
- 🔧 Environment configuration
- 📝 Comprehensive error handling
- 🏥 Health check endpoint
- 👥 User management APIs
- 🏗️ Class-based controller architecture
- 🔄 Service layer pattern
- 📦 Clean separation of concerns
- 🗄️ MongoDB with Mongoose ODM
- 📄 Pagination support
- 🔍 Search functionality
- 🌱 Database seeding scripts

## API Endpoints

### Health Check
- `GET /api/v1/health` - Server health status

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/change-password` - Change password (authenticated users)

### User Management
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID (authenticated)
- `GET /api/v1/users/email/:email` - Get user by email (admin only)
- `POST /api/v1/users` - Create new user (admin only)
- `PUT /api/v1/users/:id` - Update user (own profile or admin)
- `DELETE /api/v1/users/:id` - Delete user (admin only)
- `GET /api/v1/users/search?q=query` - Search users (admin only)
- `GET /api/v1/users/:id/info` - Get user detailed info (authenticated)
- `GET /api/v1/users/active` - Get active users (admin only)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Start MongoDB (if running locally):
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using MongoDB service
sudo systemctl start mongod
```

4. Seed the database with sample data:
```bash
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── controllers/     # Class-based route controllers
├── middleware/      # Custom middleware (error handling, 404)
├── models/         # TypeScript interfaces and Mongoose schemas
├── routes/         # API route definitions
├── services/       # Business logic and data access
├── config/         # Database configuration
├── scripts/        # Database seeding scripts
└── server.ts       # Main server file
```

## Architecture

This project follows a **class-based controller architecture** with clean separation of concerns:

- **Controllers**: Handle HTTP requests/responses and route logic
- **Services**: Contain business logic and data operations
- **Models**: Define TypeScript interfaces and Mongoose schemas
- **Routes**: Define API endpoints and connect to controllers
- **Middleware**: Handle cross-cutting concerns (errors, logging)
- **Config**: Database connection and configuration

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `API_VERSION` - API version (default: v1)

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400
  }
}
```
