# Hướng dẫn Cài đặt và Triển khai

## Yêu cầu hệ thống

- Node.js >= 16.x
- MySQL >= 8.0
- Git
- MetaMask hoặc ví Ethereum khác

## Cài đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd certificate-verification-system
```

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=<your-contract-address>
REACT_APP_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

Đăng nhập Google cần cùng một **OAuth 2.0 Client ID** ở frontend và backend. Trong Google Cloud Console, cấu hình Authorized JavaScript origins cho `http://localhost:3000` và domain frontend khi triển khai. Luồng authorization-code cần cả Client ID và Client Secret ở backend; **chỉ Client ID** được đặt ở frontend. Không đưa Client Secret vào frontend, file mẫu hoặc repository.

Khởi chạy:
```bash
npm start
```

Frontend sẽ chạy tại: http://localhost:3000

### 3. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=certificate_verification
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-rotated-google-oauth-client-secret>
EMAIL_USER=<your-gmail-address>
EMAIL_APP_PASSWORD=<your-gmail-app-password>
SUPPORT_NOTIFICATION_EMAIL=linhyang0702@gmail.com
CONTRACT_ADDRESS=your_contract_address
INFURA_PROJECT_ID=your_infura_id
PRIVATE_KEY=your_private_key
```

Để đăng nhập Google hoạt động, cấu hình `GOOGLE_CLIENT_ID` giống Client ID ở frontend và đặt `GOOGLE_CLIENT_SECRET` trong `backend/.env` bằng secret đã tạo mới sau khi thu hồi secret bị lộ. Không chia sẻ hoặc commit secret này; tuyệt đối không đặt client secret trong biến `REACT_APP_*` vì các biến đó được đóng gói vào frontend. Origin của frontend (ví dụ `http://localhost:3000`) phải nằm trong Authorized JavaScript origins của OAuth client. Server sử dụng origin của yêu cầu đăng nhập khi đổi authorization code. Nếu database đã tồn tại, chạy migration `database/migrations/20261027_add_google_id_to_users.sql` một lần trước khi khởi động backend; schema mới đã có sẵn cột này.
Để nhận email khi người dùng gửi yêu cầu tạo tài khoản/cấp lại mật khẩu, cấu hình `EMAIL_USER` và `EMAIL_APP_PASSWORD` trong `backend/.env` bằng Gmail và mật khẩu ứng dụng của Gmail (không phải mật khẩu đăng nhập Gmail). Đặt `SUPPORT_NOTIFICATION_EMAIL=linhyang0702@gmail.com` để chọn hộp thư nhận yêu cầu. Biểu mẫu chỉ báo gửi thành công sau khi email được gửi; lỗi SMTP sẽ hiển thị để người dùng thử lại.
Đăng nhập Google chỉ dùng được với email đã có tài khoản trong hệ thống. Email chưa đăng ký sẽ bị từ chối đăng nhập; quản trị viên cần cấp tài khoản trước. Vai trò nhà trường/cán bộ cũng cần được quản trị viên cấp riêng.

Khởi chạy:
```bash
npm run dev
```

Backend API sẽ chạy tại: http://localhost:5000

### 4. Cài đặt Database

Kết nối MySQL và chạy:
```bash
mysql -u root -p < database/schema.sql
```

Hoặc import trực tiếp trong MySQL Workbench/phpMyAdmin.

Nếu database đã có tài khoản admin với email `admin@school.edu.vn`, chạy một lần migration
`database/migrations/20261028_update_admin_email.sql` để đổi sang `linhyang0702@gmail.com`.

### 5. Cài đặt Blockchain (Hardhat)

```bash
cd blockchain
npm install
```

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:
```env
INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Biên dịch Smart Contract:
```bash
npm run compile
```

Deploy lên Sepolia Testnet:
```bash
npm run deploy:sepolia
```

Lưu lại `CONTRACT_ADDRESS` sau khi deploy thành công.

## Cấu hình MetaMask

1. Cài đặt extension MetaMask
2. Thêm Sepolia Test Network
3. Lấy test ETH từ: https://sepoliafaucet.com/

## Kiểm tra

Truy cập: http://localhost:3000

## Troubleshooting

### Lỗi kết nối Database
- Kiểm tra MySQL đang chạy
- Xác nhận thông tin đăng nhập trong `.env`
- Đảm bảo database đã được tạo

### Lỗi Blockchain
- Kiểm tra Infura Project ID
- Đảm bảo ví có đủ test ETH
- Xác nhận Private Key đúng format (không có prefix `0x` trong .env)

### Lỗi Port đã được sử dụng
```bash
# Thay đổi PORT trong file .env của backend
PORT=5001
```

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy folder 'build'
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
# Cấu hình environment variables
# Deploy theo hướng dẫn của platform
```

### Database (MySQL Cloud)
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Database

## Bảo mật

⚠️ **QUAN TRỌNG:**
- KHÔNG commit file `.env` lên Git
- KHÔNG chia sẻ Private Key
- Sử dụng environment variables cho production
- Thay đổi JWT_SECRET trước khi deploy
