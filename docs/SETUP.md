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
```

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
CONTRACT_ADDRESS=your_contract_address
INFURA_PROJECT_ID=your_infura_id
PRIVATE_KEY=your_private_key
```

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
