import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt, FaWallet, FaSpinner, FaExternalLinkAlt,
  FaCopy, FaCheckCircle, FaTimesCircle, FaUnlink
} from 'react-icons/fa';
import { getAddress } from 'ethers';
import { api } from '../../services/api';
import './WalletConnection.css';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

/**
 * Kiểm tra và chuyển MetaMask sang mạng Sepolia.
 */
const ensureSepoliaNetwork = async (ethereum) => {
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId === SEPOLIA_CHAIN_ID) return;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  } catch (error) {
    if (error.code !== 4902) throw error;

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: SEPOLIA_CHAIN_ID,
        chainName: 'Sepolia',
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io']
      }]
    });
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }]
    });
  }

  const activeChainId = await ethereum.request({ method: 'eth_chainId' });
  if (activeChainId !== SEPOLIA_CHAIN_ID) {
    throw new Error('Vui lòng chuyển MetaMask sang mạng Ethereum Sepolia để tiếp tục.');
  }
};

/**
 * WalletConnectButton – nút kết nối ví đặt trong sidebar.
 *
 * Quy tắc hiển thị:
 *  - "Đã kết nối" CHỈ khi người dùng ĐÃ bấm kết nối trong phiên này
 *    và MetaMask đã phê duyệt thành công.
 *  - Việc DB có wallet_address KHÔNG tự động hiển thị trạng thái "Đã kết nối".
 *
 * Quy trình kết nối:
 *   1. Kiểm tra window.ethereum (MetaMask extension phải được cài)
 *   2. Chuyển sang mạng Sepolia
 *   3. Mở popup MetaMask để người dùng chọn tài khoản & xác nhận
 *   4. Nếu user đã có wallet_address trong DB → kiểm tra địa chỉ có khớp không
 *      - Không khớp → báo lỗi, connect thất bại
 *      - Khớp       → connect thành công (không gọi API lại)
 *   5. Nếu user chưa có wallet_address → lưu địa chỉ mới vào DB
 */
export const WalletConnectButton = ({ user, onWalletConnected }) => {
  // connectedAddress: địa chỉ ví đã được xác nhận trong phiên hiện tại
  // null = chưa kết nối trong phiên này
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Khi MetaMask đổi tài khoản hoặc ngắt kết nối → reset trạng thái phiên
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        // MetaMask đã bị ngắt kết nối
        setConnectedAddress(null);
        setSuccessMessage('');
        setErrorMessage('MetaMask đã ngắt kết nối.');
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleConnect = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Bước 1: Kiểm tra MetaMask extension
    if (!window.ethereum) {
      setErrorMessage(
        'Không tìm thấy MetaMask. Vui lòng cài đặt extension MetaMask trên trình duyệt và thử lại.'
      );
      return;
    }

    setConnecting(true);
    try {
      // Bước 2: Chuyển sang mạng Sepolia
      await ensureSepoliaNetwork(window.ethereum);

      // Bước 3: Dùng wallet_requestPermissions để LUÔN buộc MetaMask
      // mở popup chọn tài khoản, dù trước đó đã cấp quyền hay chưa.
      // eth_requestAccounts chỉ hiện popup lần đầu; những lần sau nó tự
      // trả về tài khoản hiện tại mà KHÔNG hỏi lại người dùng.
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      // Sau khi người dùng xác nhận trong popup → lấy tài khoản được chọn
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask chưa cung cấp tài khoản. Vui lòng chọn một tài khoản để kết nối.');
      }

      const rawAddress = accounts[0];
      const normalizedAddress = getAddress(rawAddress); // chuẩn hóa EIP-55 checksum

      // Bước 4: Kiểm tra nếu tài khoản đã có ví đăng ký trong DB
      if (user && user.wallet_address) {
        const savedAddress = getAddress(user.wallet_address);

        if (normalizedAddress.toLowerCase() !== savedAddress.toLowerCase()) {
          // Địa chỉ không khớp → từ chối kết nối
          throw new Error(
            `Kết nối thất bại!\n` +
            `Ví MetaMask bạn đang dùng: ${normalizedAddress.slice(0, 10)}...${normalizedAddress.slice(-6)}\n` +
            `Ví đã đăng ký trong hệ thống: ${savedAddress.slice(0, 10)}...${savedAddress.slice(-6)}\n` +
            `Vui lòng chuyển sang đúng tài khoản MetaMask đã đăng ký.`
          );
        }

        // Địa chỉ khớp → kết nối thành công (không cần gọi API)
        setConnectedAddress(normalizedAddress);
        setSuccessMessage('Kết nối ví thành công!');
        if (onWalletConnected) onWalletConnected({ ...user, wallet_address: normalizedAddress });
        return;
      }

      // Bước 5: User chưa có ví → lưu địa chỉ mới vào DB
      const response = await api.connectWallet(normalizedAddress);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Không thể lưu địa chỉ ví vào tài khoản. Vui lòng thử lại.');
      }

      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('user_profile_updated'));

      setConnectedAddress(normalizedAddress);
      setSuccessMessage('Kết nối ví thành công!');
      if (onWalletConnected) onWalletConnected(response.user);

    } catch (error) {
      if (error.code === 4001) {
        setErrorMessage('Bạn đã từ chối yêu cầu kết nối ví. Hãy chấp thuận trên MetaMask để tiếp tục.');
      } else {
        setErrorMessage(error.message || 'Không thể kết nối ví. Vui lòng thử lại.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedAddress(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  // ── Đã kết nối trong phiên này → hiển thị WalletStatusCard ──
  if (connectedAddress) {
    return (
      <WalletStatusCard
        walletAddress={connectedAddress}
        onDisconnect={handleDisconnect}
      />
    );
  }

  // ── Chưa kết nối → hiển thị nút connect ──
  // Hiển thị thông tin ví đã đăng ký (nếu có) để người dùng biết cần dùng ví nào
  const registeredWallet = user && user.wallet_address;

  return (
    <div className="wallet-connect-sidebar">
      <div className="wallet-connect-sidebar-header">
        <div className="wallet-connect-sidebar-icon">
          <FaWallet />
        </div>
        <div>
          <div className="wallet-connect-sidebar-title">Ví Blockchain</div>
          <div className="wallet-connect-sidebar-status disconnected">
            <span /> Chưa kết nối
          </div>
        </div>
      </div>

      {registeredWallet && (
        <div className="wallet-connect-sidebar-registered">
          <span className="wallet-registered-label">Ví đã đăng ký:</span>
          <span className="wallet-registered-addr" title={registeredWallet}>
            {registeredWallet.slice(0, 8)}...{registeredWallet.slice(-6)}
          </span>
        </div>
      )}

      <button
        type="button"
        className="wallet-connect-sidebar-btn"
        onClick={handleConnect}
        disabled={connecting}
        title="Kết nối ví MetaMask"
      >
        {connecting ? (
          <><FaSpinner className="wallet-connect-spinner" /> Đang kết nối...</>
        ) : (
          <><FaWallet /> Kết nối ví MetaMask</>
        )}
      </button>

      {errorMessage && (
        <div className="wallet-connect-sidebar-error" role="alert">
          <FaTimesCircle style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ whiteSpace: 'pre-line' }}>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="wallet-connect-sidebar-success" role="status">
          <FaCheckCircle style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

/**
 * WalletStatusCard – hiển thị thông tin ví đã kết nối trong sidebar.
 * Chỉ được render khi người dùng đã thực sự kết nối MetaMask trong phiên này.
 */
export const WalletStatusCard = ({ walletAddress, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!walletAddress) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setCopyError('');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Không thể sao chép địa chỉ ví trên trình duyệt này.');
    }
  };

  return (
    <section className="wallet-status-card">
      <div className="wallet-status-header">
        <div className="wallet-status-icon"><FaShieldAlt /></div>
        <div>
          <div className="wallet-status-title">Blockchain</div>
          <div className="wallet-status-connected"><span />Đã kết nối</div>
        </div>
        {onDisconnect && (
          <button
            type="button"
            className="wallet-disconnect-btn"
            onClick={onDisconnect}
            title="Ngắt kết nối ví"
          >
            <FaUnlink />
          </button>
        )}
      </div>
      <div className="wallet-status-details">
        <div><span>Mạng lưới:</span><strong>Ethereum Sepolia</strong></div>
        <div>
          <span>Địa chỉ ví:</span>
          <button type="button" onClick={handleCopy} title={walletAddress}>
            {copied ? 'Đã copy!' : `${walletAddress.slice(0, 10)}...`}
          </button>
          <button
            type="button"
            className="wallet-copy-icon-btn"
            onClick={handleCopy}
            title="Sao chép địa chỉ ví"
          >
            <FaCopy />
          </button>
        </div>
      </div>
      {copyError && <div className="wallet-status-error" role="alert">{copyError}</div>}
      <a
        className="wallet-status-details-link"
        href={`https://sepolia.etherscan.io/address/${walletAddress}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaExternalLinkAlt style={{ fontSize: 10 }} /> Xem trên Etherscan
      </a>
    </section>
  );
};
