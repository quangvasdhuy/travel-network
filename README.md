# Travel Network - Tourist Social Network

A web-based social network for tourists that enables travelers to connect, share experiences, plan trips together, and discover destinations. Built with Node.js, Express, React, and Couchbase.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Trip Planning**: Create, manage, and share travel itineraries
- **Social Features**: Follow travelers, share posts, and interact with content
- **Destination Discovery**: Explore destinations with powerful search capabilities
- **Real-time Feed**: Personalized content feed based on interests and connections

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **Couchbase** - NoSQL database with N1QL and Full-Text Search
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - Modern component-based UI
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Couchbase Server** (v7.0+) - [Download here](https://www.couchbase.com/downloads)

### Couchbase Setup

1. Install and start Couchbase Server
2. Access the Couchbase Web Console (default: http://localhost:8091)
3. Complete the setup wizard:
   - Set administrator credentials
   - Configure memory quotas (minimum 256MB for data service)
4. The application will create the required buckets automatically, or you can create them manually:
   - `travel_users` - User profiles and authentication
   - `travel_content` - Posts and comments
   - `travel_trips` - Trip plans and itineraries
   - `travel_social` - Social connections and relationships

## 🏃‍♂️ Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd travelnetwork
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
copy .env.example .env
```

Edit `.env` and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Couchbase Configuration
COUCHBASE_CONNECTION_STRING=couchbase://localhost
COUCHBASE_USERNAME=Administrator
COUCHBASE_PASSWORD=your_password_here

# JWT Configuration (change in production!)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

### 4. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see a response with status "healthy" and database connection information.

## 📁 Project Structure

```
travelnetwork/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Couchbase connection manager
│   │   └── index.js      # Application configuration
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/           # API routes
│   │   └── health.js     # Health check endpoints
│   └── server.js         # Express server entry point
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API and database connections.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "database": {
    "status": "connected",
    "cluster": "couchbase://localhost",
    "buckets": {
      "users": { "name": "travel_users", "connected": true },
      "content": { "name": "travel_content", "connected": true },
      "trips": { "name": "travel_trips", "connected": true },
      "social": { "name": "travel_social", "connected": true }
    }
  },
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  }
}
```

### Ping

```
GET /health/ping
```

Simple endpoint to verify the API is responding.

## 🧪 Testing

Run tests:

```bash
npm test
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features (async/await, arrow functions, destructuring)
- Follow functional programming principles where appropriate
- Use meaningful variable and function names
- Add JSDoc comments for functions and classes

### Error Handling
- All async operations should be wrapped with try-catch
- Use the provided error handler middleware
- Return appropriate HTTP status codes

### Database Operations
- Always use the database connection manager
- Handle connection errors gracefully
- Use N1QL for complex queries
- Leverage Full-Text Search for text search operations

## 🚀 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure production Couchbase cluster
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review security headers

### Environment Variables (Production)

All environment variables in `.env.example` must be set for production, especially:
- `JWT_SECRET` - Must be changed from default
- `COUCHBASE_CONNECTION_STRING` - Production cluster URL
- `COUCHBASE_USERNAME` and `COUCHBASE_PASSWORD` - Production credentials

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for security
- Input validation on all endpoints (coming in later tasks)
- Rate limiting to prevent abuse (coming in later tasks)

## 📚 Additional Resources

- [Couchbase Node.js SDK Documentation](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please follow the code style and add tests for new features.

---

**Status**: Task 1 Complete - Basic server infrastructure with Couchbase connection is ready.

**Next Steps**: 
- Task 2: Database Schema Design and Bucket Setup
- Task 3: Authentication System
