# DevToolBox Backend - Architecture Guide

## 📐 Simplified Architecture

We're using a **simplified MVC pattern** without a service layer for easier understanding and maintenance.

```
┌─────────────────────────────────────────────────────────┐
│                     Client Request                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Middleware                    │
│  • CORS, Helmet, Body Parser, Rate Limiting, etc.      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                        Routes                           │
│  • Define endpoints and HTTP methods                    │
│  • Apply validation middleware                          │
│  • Apply authentication middleware (if needed)          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     Controllers                         │
│  • Handle request/response                              │
│  • Contain ALL business logic                           │
│  • Interact directly with Models                        │
│  • Return standardized responses                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                       Models                            │
│  • Define data schema (Mongoose)                        │
│  • Validation rules                                     │
│  • Instance methods                                     │
│  • Static methods                                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Database                           │
│                     (MongoDB)                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   ├── redis.js         # Redis connection (optional)
│   │   ├── logger.js        # Winston logger setup
│   │   └── env.js           # Environment variables
│   │
│   ├── models/              # Mongoose models
│   │   ├── User.model.js    # User schema & methods
│   │   └── index.js         # Export all models
│   │
│   ├── controllers/         # Request handlers (ALL LOGIC HERE)
│   │   └── auth.controller.js
│   │
│   ├── routes/              # API routes
│   │   └── auth.routes.js
│   │
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Error handling
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validator.js     # Request validation
│   │
│   ├── validators/          # Joi validation schemas
│   │   └── auth.validator.js
│   │
│   ├── utils/               # Helper functions
│   │   ├── response.js      # Standardized responses
│   │   └── helpers.js       # Utility functions
│   │
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
│
├── tests/                   # Test files
├── logs/                    # Log files
├── package.json
├── .env                     # Environment variables
└── README.md
```

---

## 🔄 Request Flow Example

### Example: User Login

**1. Client Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**2. Middleware Chain:**
```javascript
// app.js - Global middleware
helmet() → cors() → bodyParser() → rateLimiter()

// auth.routes.js - Route-specific middleware
validate(loginSchema) → login controller
```

**3. Controller (auth.controller.js):**
```javascript
export const login = asyncHandler(async (req, res) => {
  // 1. Extract data from request
  const { email, password } = req.body;

  // 2. Find user in database
  const user = await User.findByEmail(email).select('+password');
  
  // 3. Validate password
  const isValid = await user.comparePassword(password);
  
  // 4. Generate tokens
  const accessToken = generateToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id, user.email);
  
  // 5. Update user data
  await user.addRefreshToken(refreshToken);
  user.lastLogin = new Date();
  await user.save();
  
  // 6. Send response
  successResponse(res, {
    user: user.getPublicProfile(),
    accessToken,
    refreshToken
  }, 'Login successful');
});
```

**4. Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## 🎯 Key Principles

### 1. **Controllers Handle Everything**
- No separate service layer
- All business logic in controllers
- Direct interaction with models
- Easier to understand and debug

### 2. **Models Define Data**
- Schema definition
- Validation rules
- Instance methods (e.g., `comparePassword()`)
- Static methods (e.g., `findByEmail()`)
- Pre/post hooks (e.g., password hashing)

### 3. **Middleware for Cross-Cutting Concerns**
- Authentication
- Validation
- Error handling
- Rate limiting
- Logging

### 4. **Standardized Responses**
```javascript
// Success
{
  "success": true,
  "message": "...",
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Error message"
}
```

---

## 🔐 Authentication Flow

### Registration/Login:
1. User sends credentials
2. Controller validates and creates/finds user
3. Generate JWT tokens (access + refresh)
4. Store refresh token in database
5. Return both tokens to client

### Protected Routes:
1. Client sends request with `Authorization: Bearer <token>`
2. `protect` middleware validates token
3. Adds `req.user` with user info
4. Controller can access `req.user.id`

### Token Refresh:
1. Client sends refresh token
2. Controller validates refresh token
3. Checks if token exists in user's tokens array
4. Generates new access token
5. Returns new access token

---

## 🛠️ Adding New Features

### Step-by-Step Guide:

#### 1. Create Model (if needed)
```javascript
// src/models/Collection.model.js
import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  // ... other fields
});

export default mongoose.model('Collection', collectionSchema);
```

#### 2. Create Validator
```javascript
// src/validators/collection.validator.js
import Joi from 'joi';

export const createCollectionSchema = Joi.object({
  name: Joi.string().required(),
  // ... other validations
});
```

#### 3. Create Controller
```javascript
// src/controllers/collection.controller.js
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { Collection } from '../models/index.js';
import { successResponse } from '../utils/response.js';

export const createCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  // All logic here
  const collection = await Collection.create({ name, userId });

  successResponse(res, { collection }, 'Collection created', 201);
});
```

#### 4. Create Routes
```javascript
// src/routes/collection.routes.js
import express from 'express';
import { createCollection } from '../controllers/collection.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { createCollectionSchema } from '../validators/collection.validator.js';

const router = express.Router();

router.post('/', protect, validate(createCollectionSchema), createCollection);

export default router;
```

#### 5. Mount Routes in app.js
```javascript
// src/app.js
import collectionRoutes from './routes/collection.routes.js';

app.use(`/api/${config.apiVersion}/collections`, collectionRoutes);
```

---

## 📦 Dependencies

### Core:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **dotenv** - Environment variables

### Security:
- **helmet** - Security headers
- **cors** - Cross-origin requests
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **express-mongo-sanitize** - NoSQL injection prevention
- **express-rate-limit** - Rate limiting

### Validation & Utilities:
- **joi** - Request validation
- **winston** - Logging
- **morgan** - HTTP logging
- **compression** - Response compression

### Optional:
- **redis** - Caching & token blacklisting
- **socket.io** - WebSocket (for collaboration)

---

## 🚨 Error Handling

### Custom Error Class:
```javascript
throw new AppError('Error message', statusCode);
```

### Async Handler:
```javascript
export const someController = asyncHandler(async (req, res) => {
  // Any errors thrown here are caught automatically
});
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}
```

---

## 📝 Best Practices

1. **Always use asyncHandler** for async controllers
2. **Validate all inputs** with Joi schemas
3. **Use AppError** for custom errors
4. **Return standardized responses** with successResponse()
5. **Keep controllers focused** - one responsibility per function
6. **Use meaningful variable names**
7. **Add comments** for complex logic
8. **Handle edge cases** (user not found, invalid data, etc.)

---

## 🔍 Debugging Tips

1. **Check logs:** `logs/error.log` and `logs/combined.log`
2. **Use console.log** in development (removed in production)
3. **Test with cURL** or Postman
4. **Check MongoDB** directly with mongosh
5. **Verify environment variables** in `.env`

---

Last Updated: 2025-10-29
