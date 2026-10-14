/**
 * Script kiểm tra kết nối blockchain và ABI trước khi chạy server
 * Usage: node scripts/test-blockchain.js
 */
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
// Load từ blockchain/.env (thư mục cha của scripts/)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testBlockchainConnection() {
  console.log('\n🔍 Kiểm tra kết nối Blockchain...\n');

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  console.log(`📡 RPC URL    : ${rpcUrl ? rpcUrl.substring(0, 50) + '...' : '❌ MISSING'}`);
  console.log(`📄 Contract   : ${contractAddress || '❌ MISSING'}`);
  console.log(`🔑 Private Key: ${privateKey ? '✅ SET (' + privateKey.substring(0, 6) + '...)' : '❌ MISSING'}\n`);

  if (!rpcUrl || !privateKey || !contractAddress) {
    console.error('❌ Thiếu biến môi trường. Kiểm tra backend/.env');
    process.exit(1);
  }

  // Load ABI - artifacts nằm tại blockchain/artifacts/
  const artifactPath = path.join(
    __dirname,
    '../artifacts/contracts/CertificateVerification.sol/CertificateVerification.json'
  );

  if (!fs.existsSync(artifactPath)) {
    console.error('❌ ABI file not found. Chạy: cd blockchain && npx hardhat compile');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  console.log('✅ ABI loaded from:', path.relative(process.cwd(), artifactPath));

  // Connect
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  try {
    // Kiểm tra network
    const network = await provider.getNetwork();
    console.log(`\n🌐 Network    : ${network.name} (chainId: ${network.chainId})`);
    
    // Kiểm tra balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet     : ${wallet.address}`);
    console.log(`💎 Balance    : ${ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
      console.warn('⚠️  Cảnh báo: Ví có balance = 0 ETH. Cần nạp ETH test từ Sepolia faucet để gọi contract!');
    }

    // Kiểm tra contract
    const totalCerts = await contract.getTotalCertificates();
    const isAuthorized = await contract.authorizedIssuers(wallet.address);

    console.log(`📋 Tổng văn bằng on-chain: ${totalCerts.toString()}`);
    console.log(`🛡️  Ví có quyền phát hành: ${isAuthorized ? '✅ Có' : '❌ Không (cần gọi authorizeIssuer)'}`);
    console.log(`\n✅ Kết nối Blockchain THÀNH CÔNG!\n`);
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
    process.exit(1);
  }
}

testBlockchainConnection();
