# DevToolBox Backend

Backend API for DevToolBox - A modern developer productivity platform.

## 🚀 Features

- **API Tester** - REST API testing with collections
- **Regex Tester** - Test and save regex patterns
- **Code Formatter** - Format JSON, HTML, CSS, JS, XML, Markdown
- **JSON Tools** - Validate, convert, and diff JSON
- **Generators** - UUID, Hash, Base64 encoding
- **Mock Server** - Create dynamic mock APIs
- **Real-time Collaboration** - WebSocket-based code sharing
- **Developer Notes** - Markdown notes with project organization
- **And much more...**

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0 (optional, for caching and sessions)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dev-tools/backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB and Redis (if using):
```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

5. Run the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Business logic services
│   ├── validators/      # Request validation schemas
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── tests/               # Test files
├── logs/                # Log files
└── package.json
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## 📚 API Documentation

API documentation is available at `/api-docs` when the server is running.

## 🧪 Testing

```bash
npm test
```

## 🔐 Environment Variables

See `.env.example` for all available environment variables.

## 📝 License

MIT
