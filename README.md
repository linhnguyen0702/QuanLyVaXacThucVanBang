# Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số

## Giới thiệu
Hệ thống quản lý và xác thực văn bằng, chứng chỉ số sử dụng công nghệ Blockchain để đảm bảo tính minh bạch, bảo mật và tin cậy.

## Công nghệ sử dụng
- **Frontend**: ReactJS
- **Backend**: NodeJS + ExpressJS
- **Database**: MySQL
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contract**: Solidity
- **Blockchain Framework**: Hardhat
- **Blockchain Library**: ethers.js

## Cấu trúc dự án
```
├── frontend/          # Ứng dụng React
├── backend/           # API Server NodeJS/Express
├── blockchain/        # Smart Contracts & Hardhat
├── database/          # SQL schemas & migrations
├── docs/             # Tài liệu dự án
└── README.md
```

## Tính năng chính

### Phía Nhà trường
- Upload thông tin sinh viên tốt nghiệp
- Ký số văn bằng
- Quản lý danh sách văn bằng đã cấp

### Phía Sinh viên
- Nhận chứng chỉ số (NFT)
- Xem thông tin văn bằng
- Tải văn bằng số

### Phía Nhà tuyển dụng
- Quét mã QR để xác thực
- Nhập mã chứng chỉ để kiểm tra
- Xem thông tin chi tiết văn bằng trên Blockchain

## Cài đặt

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Blockchain
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## License
MIT License

## Tác giả
© 2024 - Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số
