const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

let provider = null;
let signer = null;
let contract = null;
let contractABI = null;

/**
 * Tải ABI của smart contract từ thư mục artifacts của Hardhat
 */
const loadContractABI = () => {
  try {
    // Đường dẫn tới artifact file do Hardhat compile sinh ra
    const artifactPath = path.join(
      __dirname,
      '../../blockchain/artifacts/contracts/CertificateVerification.sol/CertificateVerification.json'
    );

    if (!fs.existsSync(artifactPath)) {
      console.warn('⚠️  Contract ABI file not found. Please compile contracts first: cd blockchain && npx hardhat compile');
      return null;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (err) {
    console.error('❌ Failed to load contract ABI:', err.message);
    return null;
  }
};

/**
 * Khởi tạo kết nối tới Ethereum Sepolia Testnet
 */
const initBlockchain = () => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    // Ưu tiên SEPOLIA_RPC_URL (Alchemy), fallback về Infura nếu có INFURA_PROJECT_ID
    const rpcUrl = process.env.SEPOLIA_RPC_URL
      || (process.env.INFURA_PROJECT_ID ? `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}` : null);

    if (!rpcUrl || !privateKey || !contractAddress) {
      console.warn('⚠️  Blockchain env vars missing (SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS). Blockchain features disabled.');
      return false;
    }

    // Kết nối tới Sepolia
    provider = new ethers.JsonRpcProvider(rpcUrl);

    // Tạo signer từ private key
    signer = new ethers.Wallet(privateKey, provider);

    // Load ABI
    contractABI = loadContractABI();
    if (!contractABI) {
      console.warn('⚠️  Could not load contract ABI. Blockchain features disabled.');
      return false;
    }

    // Tạo contract instance
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log('✅ Blockchain connected to Ethereum Sepolia Testnet (Alchemy)');
    console.log(`   📄 Contract: ${contractAddress}`);
    console.log(`   🔑 Signer  : ${signer.address}`);
    console.log(`   🌐 RPC     : ${rpcUrl.substring(0, 50)}...`);

    return true;
  } catch (err) {
    console.error('❌ Blockchain initialization failed:', err.message);
    return false;
  }
};

/**
 * Lấy contract instance (đọc + ghi)
 */
const getContract = () => contract;

/**
 * Lấy contract instance chỉ đọc (không cần signer)
 */
const getReadonlyContract = () => {
  if (!provider || !contractABI || !process.env.CONTRACT_ADDRESS) return null;
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
};

/**
 * Lấy provider
 */
const getProvider = () => provider;

/**
 * Kiểm tra blockchain đã được khởi tạo chưa
 */
const isBlockchainReady = () => {
  return contract !== null && signer !== null;
};

/**
 * Phát hành văn bằng lên blockchain
 * @param {Object} certData - Dữ liệu văn bằng
 * @returns {Object} { txHash, blockNumber, certificateId }
 */
const issueCertificateOnChain = async (certData) => {
  if (!isBlockchainReady()) {
    throw new Error('Blockchain chưa được khởi tạo. Kiểm tra file .env.');
  }

  const {
    certificateCode,
    studentName,
    studentId,
    university,
    major,
    degreeType,
    issueDate,
    certificateHash
  } = certData;

  // Chuyển issueDate sang Unix timestamp (seconds)
  const issueDateTs = Math.floor(new Date(issueDate).getTime() / 1000);

  console.log(`🔗 Issuing certificate on blockchain: ${certificateCode}`);

  // Gọi hàm issueCertificate trên smart contract
  const tx = await contract.issueCertificate(
    certificateCode,
    studentName,
    studentId,
    university,
    major,
    degreeType,
    issueDateTs,
    certificateHash
  );

  console.log(`📤 Transaction sent: ${tx.hash}`);

  // Chờ transaction được xác nhận (1 block)
  const receipt = await tx.wait(1);

  console.log(`✅ Certificate issued on-chain. Block: ${receipt.blockNumber}`);

  // Parse CertificateIssued event để lấy certificateId
  let blockchainCertificateId = null;
  if (receipt.logs && contractABI) {
    const iface = new ethers.Interface(contractABI);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === 'CertificateIssued') {
          blockchainCertificateId = parsed.args.certificateId.toString();
          break;
        }
      } catch (e) {
        // không phải log của contract này
      }
    }
  }

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    blockchainCertificateId,
    gasUsed: receipt.gasUsed.toString()
  };
};

/**
 * Xác thực văn bằng trực tiếp từ blockchain (chỉ đọc)
 * @param {string} certificateCode - Mã số văn bằng
 * @returns {Object} Kết quả xác thực
 */
const verifyCertificateOnChain = async (certificateCode) => {
  const readContract = getReadonlyContract();
  if (!readContract) {
    return null; // Blockchain không khả dụng → fallback về DB
  }

  try {
    const result = await readContract.verifyCertificateByCode(certificateCode);
    return {
      isValid: result[0],
      certificateId: result[1].toString(),
      studentName: result[2],
      university: result[3],
      major: result[4],
      issueDate: result[5].toString()
    };
  } catch (err) {
    console.error('❌ On-chain verification failed:', err.message);
    return null;
  }
};

/**
 * Xác thực văn bằng bằng hash từ blockchain
 * @param {string} certificateHash - Hash văn bằng
 */
const verifyCertificateByHashOnChain = async (certificateHash) => {
  const readContract = getReadonlyContract();
  if (!readContract) return null;

  try {
    const result = await readContract.verifyCertificateByHash(certificateHash);
    return {
      isValid: result[0],
      certificateId: result[1].toString(),
      certificateCode: result[2]
    };
  } catch (err) {
    console.error('❌ On-chain hash verification failed:', err.message);
    return null;
  }
};

module.exports = {
  initBlockchain,
  getContract,
  getReadonlyContract,
  getProvider,
  isBlockchainReady,
  issueCertificateOnChain,
  verifyCertificateOnChain,
  verifyCertificateByHashOnChain
};
