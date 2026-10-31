import React, { useState, useEffect, useRef } from 'react';
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
 * Khi tải lại dashboard, chỉ tự khôi phục kết nối đã được MetaMask cấp quyền
 * và có địa chỉ khớp với ví đã liên kết trong tài khoản.
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
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const userRef = useRef(user);
  const onWalletConnectedRef = useRef(onWalletConnected);
  const autoReconnectPromise = useRef(null);

  const getConnectionErrorMessage = (error) => {
    if (error.code === 4001) {
      return 'Bạn đã từ chối yêu cầu kết nối hoặc chuyển mạng trong MetaMask.';
    }
    return error.message || 'Không thể kết nối với MetaMask. Vui lòng thử lại.';
  };

  useEffect(() => {
    userRef.current = user;
    onWalletConnectedRef.current = onWalletConnected;
  }, [user, onWalletConnected]);

  const connectAccount = async (rawAddress, allowNewWallet) => {
    const normalizedAddress = getAddress(rawAddress);
    const currentUser = userRef.current;

    if (currentUser && currentUser.wallet_address) {
      const savedAddress = getAddress(currentUser.wallet_address);
      if (normalizedAddress.toLowerCase() !== savedAddress.toLowerCase()) {
        throw new Error(
          `Địa chỉ ví MetaMask không khớp với tài khoản đang đăng nhập.\n` +
          `Ví đang chọn: ${normalizedAddress.slice(0, 10)}...${normalizedAddress.slice(-6)}\n` +
          `Ví đã đăng ký: ${savedAddress.slice(0, 10)}...${savedAddress.slice(-6)}\n` +
          'Vui lòng chuyển sang đúng tài khoản MetaMask.'
        );
      }
    } else if (!allowNewWallet) {
      throw new Error('MetaMask đang có tài khoản nhưng tài khoản này chưa liên kết ví. Nhấn “Kết nối ví MetaMask” để xác nhận liên kết.');
    }

    await ensureSepoliaNetwork(window.ethereum);

    if (!currentUser || !currentUser.wallet_address) {
      const response = await api.connectWallet(normalizedAddress);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Không thể lưu địa chỉ ví vào tài khoản. Vui lòng thử lại.');
      }

      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('user_profile_updated'));
      userRef.current = response.user;
      setConnectedAddress(normalizedAddress);
      setSuccessMessage('Kết nối ví thành công!');
      onWalletConnectedRef.current?.(response.user);
      return;
    }

    setConnectedAddress(normalizedAddress);
    setSuccessMessage('Kết nối ví thành công!');
    onWalletConnectedRef.current?.({ ...currentUser, wallet_address: normalizedAddress });
  };

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    let active = true;
    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setConnectedAddress(null);
        setSuccessMessage('');
        setErrorMessage('MetaMask đã ngắt kết nối hoặc không còn tài khoản được cấp quyền.');
        return;
      }

      setErrorMessage('');
      setSuccessMessage('');
      setConnecting(true);
      try {
        await connectAccount(accounts[0], false);
      } catch (error) {
        setConnectedAddress(null);
        setErrorMessage(getConnectionErrorMessage(error));
      } finally {
        setConnecting(false);
      }
    };

    const handleChainChanged = (chainId) => {
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setConnectedAddress(null);
        setSuccessMessage('');
        setErrorMessage('MetaMask đã chuyển sang mạng khác. Vui lòng chọn Ethereum Sepolia và kết nối lại ví.');
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    if (!autoReconnectPromise.current) {
      autoReconnectPromise.current = ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts) => {
          if (!accounts || accounts.length === 0) return null;
          if (!userRef.current || !userRef.current.wallet_address) {
            throw new Error('MetaMask đang có tài khoản nhưng tài khoản này chưa liên kết với hồ sơ. Nhấn “Kết nối ví MetaMask” để xác nhận.');
          }

          const normalizedAddress = getAddress(accounts[0]);
          const savedAddress = getAddress(userRef.current.wallet_address);
          if (normalizedAddress.toLowerCase() !== savedAddress.toLowerCase()) {
            throw new Error(
              `Không thể tự động kết nối: địa chỉ ví MetaMask không khớp với tài khoản đang đăng nhập.\n` +
              `Ví đang chọn: ${normalizedAddress.slice(0, 10)}...${normalizedAddress.slice(-6)}\n` +
              `Ví đã đăng ký: ${savedAddress.slice(0, 10)}...${savedAddress.slice(-6)}\n` +
              'Vui lòng chuyển sang đúng tài khoản MetaMask.'
            );
          }

          await ensureSepoliaNetwork(ethereum);
          return normalizedAddress;
        })
        .catch((error) => ({ error }));
    }

    const reconnectAttempt = autoReconnectPromise.current;
    setConnecting(true);
    reconnectAttempt.then((result) => {
      if (!active) return;
      if (result && result.error) {
        setConnectedAddress(null);
        setErrorMessage(getConnectionErrorMessage(result.error));
      } else if (result) {
        setConnectedAddress(result);
        setErrorMessage('');
        setSuccessMessage('Đã tự động kết nối lại ví MetaMask.');
      }
      setConnecting(false);
    }).finally(() => {
      if (autoReconnectPromise.current === reconnectAttempt) {
        autoReconnectPromise.current = null;
      }
    });

    return () => {
      active = false;
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
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
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask chưa cung cấp tài khoản. Vui lòng chọn một tài khoản để kết nối.');
      }

      await connectAccount(accounts[0], true);
    } catch (error) {
      setErrorMessage(getConnectionErrorMessage(error));
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
