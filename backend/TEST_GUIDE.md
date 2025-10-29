# Testing Guide - DevToolBox Backend

## Phase 2: Authentication Testing

### Prerequisites
- Server must be running: `npm run dev`
- MongoDB must be connected

### Testing Methods

#### Option 1: Using cURL

**1. Register a new user:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` and `refreshToken` from the response.

**3. Get current user (replace TOKEN):**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Update profile:**
```bash
curl -X PUT http://localhost:5000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated Name"
  }'
```

**5. Change password:**
```bash
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

**6. Refresh token:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**7. Logout:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

#### Option 2: Using Postman

1. Import the collection from `tests/auth.test.http`
2. Create environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `accessToken`: (will be set after login)
   - `refreshToken`: (will be set after login)

3. Test endpoints in order:
   - Register → Login → Get Me → Update Profile → etc.

---

#### Option 3: Using REST Client (VS Code Extension)

1. Install "REST Client" extension in VS Code
2. Open `tests/auth.test.http`
3. Click "Send Request" above each request
4. Copy tokens from responses and replace in subsequent requests

---

### Expected Responses

#### Successful Registration (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "user",
      "isEmailVerified": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Successful Login (200):
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

#### Error Response (400/401/404):
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

### Common Error Cases to Test

1. **Duplicate Email Registration**
   - Register same email twice
   - Expected: 400 - "User with this email already exists"

2. **Invalid Email Format**
   - Use invalid email format
   - Expected: 400 - Validation error

3. **Short Password**
   - Password less than 6 characters
   - Expected: 400 - "Password must be at least 6 characters"

4. **Wrong Login Credentials**
   - Incorrect password
   - Expected: 401 - "Invalid email or password"

5. **Access Protected Route Without Token**
   - No Authorization header
   - Expected: 401 - "Not authorized to access this route"

6. **Invalid/Expired Token**
   - Use invalid or expired token
   - Expected: 401 - "Invalid token" or "Token expired"

---

### Testing Checklist

- [ ] User can register with valid data
- [ ] User cannot register with duplicate email
- [ ] User cannot register with invalid email
- [ ] User cannot register with short password
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] User can access protected routes with valid token
- [ ] User cannot access protected routes without token
- [ ] User can get their profile
- [ ] User can update their profile
- [ ] User can change password
- [ ] User can refresh access token
- [ ] User can logout
- [ ] User can logout from all devices
- [ ] Rate limiting works (try 6+ login attempts quickly)

---

### Database Verification

Check MongoDB to verify data:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use devtoolbox

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "test@example.com" })

# Delete test user (cleanup)
db.users.deleteOne({ email: "test@example.com" })
```

---

### Next Steps

After authentication is working:
- ✅ Phase 2 Complete
- 🔄 Move to Phase 3: API Tester Backend
- 🔄 Implement Collections & Requests models
- 🔄 Build API proxy service
