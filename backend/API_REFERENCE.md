# DevToolBox API Reference

Base URL: `http://localhost:5000/api/v1`

---

## 🔐 Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/auth/refresh` require authentication.

**Header:**
```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (protected) |
| POST | `/auth/logout-all` | Logout all devices (protected) |
| GET | `/auth/me` | Get current user (protected) |
| PUT | `/auth/profile` | Update profile (protected) |
| PUT | `/auth/change-password` | Change password (protected) |

---

## 📁 Collections

Organize your API requests into collections.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/collections` | Create collection |
| GET | `/collections` | Get all collections |
| GET | `/collections?search=keyword&page=1&limit=20` | Search collections |
| GET | `/collections/:id` | Get collection with requests |
| PUT | `/collections/:id` | Update collection |
| DELETE | `/collections/:id` | Delete collection |
| POST | `/collections/:id/duplicate` | Duplicate collection |

**Create Collection:**
```json
POST /api/v1/collections
{
  "name": "My API Collection",
  "description": "Optional description",
  "color": "#3B82F6",
  "icon": "folder",
  "isPublic": false
}
```

---

## 📝 Requests

Save and manage API requests.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/requests` | Create request |
| GET | `/requests/collection/:collectionId` | Get requests by collection |
| GET | `/requests/:id` | Get single request |
| PUT | `/requests/:id` | Update request |
| DELETE | `/requests/:id` | Delete request |
| POST | `/requests/execute` | Execute request (proxy) |
| POST | `/requests/:id/duplicate` | Duplicate request |

**Create Request:**
```json
POST /api/v1/requests
{
  "collectionId": "collection_id_here",
  "name": "Get Users",
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  "queryParams": {
    "page": "1",
    "limit": "10"
  },
  "body": null,
  "bodyType": "none",
  "auth": {
    "type": "bearer",
    "token": "your-token"
  },
  "description": "Fetch all users"
}
```

**Execute Request (Proxy):**
```json
POST /api/v1/requests/execute
{
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": null,
  "timeout": 30000,
  "requestId": "optional_request_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request executed successfully",
  "data": {
    "status": 200,
    "statusText": "OK",
    "headers": { ... },
    "data": { ... },
    "time": 245,
    "size": 1024
  }
}
```

---

## 🌍 Environments

Manage environment variables for different contexts (dev, staging, prod).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/environments` | Create environment |
| GET | `/environments` | Get all environments |
| GET | `/environments/active` | Get active environment |
| GET | `/environments/:id` | Get single environment |
| PUT | `/environments/:id` | Update environment |
| PUT | `/environments/:id/activate` | Activate environment |
| DELETE | `/environments/:id` | Delete environment |

**Create Environment:**
```json
POST /api/v1/environments
{
  "name": "Development",
  "variables": {
    "baseUrl": "https://api.dev.example.com",
    "apiKey": "dev-key-123",
    "timeout": "5000"
  },
  "isActive": true
}
```

---

## 📊 History

Track all executed requests.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get history |
| GET | `/history?method=GET&search=keyword&page=1&limit=20` | Filter history |
| GET | `/history/stats` | Get statistics |
| GET | `/history/:id` | Get single entry |
| DELETE | `/history/:id` | Delete entry |
| DELETE | `/history` | Clear all history |

**History Entry:**
```json
{
  "_id": "...",
  "userId": "...",
  "requestId": "...",
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": { ... },
  "body": null,
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": { ... },
    "data": { ... },
    "time": 245,
    "size": 1024
  },
  "executedAt": "2025-11-09T00:00:00.000Z"
}
```

**Statistics:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 150,
    "byMethod": [
      { "_id": "GET", "count": 80, "avgTime": 234 },
      { "_id": "POST", "count": 50, "avgTime": 456 },
      { "_id": "PUT", "count": 15, "avgTime": 389 },
      { "_id": "DELETE", "count": 5, "avgTime": 123 }
    ]
  }
}
```

---

## 📋 Standard Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🚦 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 🔒 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| General API | 100 requests / 15 minutes |
| Auth endpoints | 5 requests / 15 minutes |
| Request execution | 30 requests / 1 minute |

---

## 💡 Usage Examples

### Complete Workflow:

**1. Register & Login:**
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

**2. Create Collection:**
```bash
curl -X POST http://localhost:5000/api/v1/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test APIs","description":"My test collection"}'
```

**3. Create Request:**
```bash
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId":"COLLECTION_ID",
    "name":"Get Users",
    "method":"GET",
    "url":"https://jsonplaceholder.typicode.com/users"
  }'
```

**4. Execute Request:**
```bash
curl -X POST http://localhost:5000/api/v1/requests/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method":"GET",
    "url":"https://jsonplaceholder.typicode.com/users"
  }'
```

**5. View History:**
```bash
curl -X GET http://localhost:5000/api/v1/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing

Use the provided test files:
- `tests/auth.test.http` - Authentication tests
- `tests/api-tester.test.http` - API Tester feature tests

Or use Postman/Insomnia to import and test the endpoints.

---

Last Updated: 2025-11-09
