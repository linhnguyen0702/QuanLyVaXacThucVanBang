# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "student"
  }
}
```

### Certificates

#### Get All Certificates
```http
GET /api/certificates
Authorization: Bearer <token>
```

#### Get Certificate by ID
```http
GET /api/certificates/:id
```

#### Create Certificate
```http
POST /api/certificates
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": 1,
  "major": "Computer Science",
  "degreeType": "bachelor",
  "issueDate": "2024-05-20",
  "gpa": 3.75
}
```

#### Update Certificate
```http
PUT /api/certificates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "issued"
}
```

### Verification

#### Verify Certificate
```http
POST /api/verification/verify
Content-Type: application/json

{
  "certificateCode": "UNI2024-000123"
}
```

Or:
```json
{
  "certificateHash": "0x7e3a...af9b2f1c"
}
```

Response:
```json
{
  "success": true,
  "valid": true,
  "certificate": {
    "id": 1,
    "certificateCode": "UNI2024-000123",
    "studentName": "Nguyễn Văn An",
    "university": "Trường Đại học Công nghệ",
    "major": "Kỹ sư Công nghệ thông tin",
    "issueDate": "2024-05-20",
    "blockchainTxHash": "0x123...",
    "status": "issued"
  }
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
