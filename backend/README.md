# VieJap Backend - .NET 8 Clean Architecture & PostgreSQL

Dự án Backend cho hệ thống **VieJap**, cung cấp API xác thực Google Login (OAuth2), phát hành JWT Bearer Token và quản lý tiến độ học tập của học viên lưu trữ trên PostgreSQL.

---

## 1. Kiến Trúc Hệ Thống (Clean Architecture)

```
backend/
├── VieJap.Backend.sln
└── src/
    ├── VieJap.Domain/                   # Lớp Thực thể Cốt lõi (Entities & Interfaces)
    │   ├── Common/                      # BaseEntity
    │   └── Entities/
    │       ├── User.cs                  # Thông tin người dùng (Email, GoogleSubjectId...)
    │       └── UserProgress.cs          # Tiến độ học (LearnedItemIds, ForgottenItemIds)
    │
    ├── VieJap.Application/              # Lớp Nghiệp Vụ (CQRS / MediatR)
    │   ├── Common/                      # Interfaces (IApplicationDbContext, IJwtTokenService...)
    │   └── Features/
    │       ├── Auth/                    # AuthenticateGoogleUserCommand & Handler
    │       └── Progress/                # GetUserProgressQuery & UpdateUserProgressCommand
    │
    ├── VieJap.Infrastructure/           # Lớp Hạ Tầng & Công Nghệ (EF Core, Services)
    │   ├── Persistence/                 # ApplicationDbContext & PostgreSQL int[] mapping
    │   │   ├── Configurations/          # Fluent API Entity Configurations
    │   │   └── Migrations/              # EF Core Migrations
    │   └── Services/
    │       ├── JwtTokenService.cs       # Cấp phát JWT Bearer Token
    │       └── GoogleAuthService.cs     # Xác thực Google ID Token qua Google.Apis.Auth
    │
    └── VieJap.WebApi/                   # Lớp Giao Tiếp API (Controllers, Program.cs)
        ├── Controllers/
        │   ├── AuthController.cs        # POST /api/auth/google-login
        │   └── ProgressController.cs    # GET /api/progress & POST /api/progress [Authorize]
        └── Services/
            └── CurrentUserService.cs    # Trích xuất UserId từ ClaimsPrincipal
```

---

## 2. Hướng Dẫn Cài Đặt & Khởi Chạy

### 2.1. Yêu Cầu Môi Trường
- **.NET 8 SDK** (hoặc .NET 9 SDK).
- **PostgreSQL 14+**.

### 2.2. Cấu Hình `appsettings.json` (`src/VieJap.WebApi/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=viejap_db;Username=postgres;Password=your_password;"
  },
  "JwtSettings": {
    "SecretKey": "VieJap_Super_Secret_Key_For_Jwt_Authentication_2026_At_Least_32_Chars",
    "Issuer": "VieJap",
    "Audience": "VieJap",
    "ExpiryDays": "7"
  },
  "GoogleAuthSettings": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  },
  "CorsOrigins": [
    "http://localhost:4200",
    "https://viejap.com"
  ]
}
```

### 2.3. Chạy Migration Tạo Database
Tại thư mục `backend/`:
```bash
dotnet ef database update --project src/VieJap.Infrastructure --startup-project src/VieJap.WebApi
```

### 2.4. Khởi Chạy Backend API
```bash
dotnet run --project src/VieJap.WebApi
```
Truy cập Swagger UI tại:
- `http://localhost:5000/swagger` hoặc `https://localhost:7001/swagger`

---

## 3. Danh Sách API Endpoints

### 3.1. Xác thực Google (`POST /api/auth/google-login`)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```
- **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "avatarUrl": "https://lh3.googleusercontent.com/a/..."
}
```

---

### 3.2. Lấy Tiến Độ Học Tập (`GET /api/progress`)
- **Yêu cầu**: Header `Authorization: Bearer {token}`
- **Response (200 OK)**:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "learnedItemIds": [1, 2, 3, 5, 8],
  "forgottenItemIds": [4, 7],
  "updatedAt": "2026-08-30T14:30:00Z"
}
```

---

### 3.3. Cập Nhật Tiến Độ Học Tập (`POST /api/progress`)
- **Yêu cầu**: Header `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "learnedItemIds": [1, 2, 3, 5, 8, 9, 10],
  "forgottenItemIds": [4]
}
```
- **Response (200 OK)**:
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "learnedItemIds": [1, 2, 3, 5, 8, 9, 10],
  "forgottenItemIds": [4],
  "updatedAt": "2026-08-30T14:35:00Z"
}
```
