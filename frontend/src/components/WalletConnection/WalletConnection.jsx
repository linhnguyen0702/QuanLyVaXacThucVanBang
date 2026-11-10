import React, { useState, useEffect, useRef } from 'react';
import {
  FaShieldAlt, FaWallet, FaSpinner, FaExternalLinkAlt,
  FaCopy, FaCheckCircle, FaTimesCircle, FaUnlink
} from 'react-icons/fa';
import { getAddress } from 'ethers';
import { api } from '../../services/api';
import './WalletConnection.css';

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const ETHEREUM_MAINNET_CHAIN_ID = '0x1';
const getWalletConnectionPreferenceKey = (address) =>
  `wallet_connection_enabled:${address.toLowerCase()}`;

const getWalletNetwork = (chainId) => {
  const normalizedChainId = String(chainId || '').toLowerCase();
  if (normalizedChainId === ETHEREUM_MAINNET_CHAIN_ID) {
    return { name: 'Ethereum Mainnet', explorerUrl: 'https://etherscan.io' };
  }
  if (normalizedChainId === SEPOLIA_CHAIN_ID) {
    return { name: 'Ethereum Sepolia', explorerUrl: 'https://sepolia.etherscan.io' };
  }
  if (!normalizedChainId) {
    return { name: 'Chưa xác định', explorerUrl: null };
  }
  return {
    name: `EVM (Chain ID ${Number.parseInt(normalizedChainId, 16)})`,
    explorerUrl: null
  };
};

const getMetaMaskProvider = () => {
  const ethereum = window.ethereum;
  if (!ethereum) return null;
  if (ethereum.providers) {
    return ethereum.providers.find((provider) => provider.isMetaMask) || null;
  }
  return ethereum.isMetaMask ? ethereum : null;
};

/**
 * WalletConnectButton – nút kết nối ví đặt trong sidebar.
 *
 * Khi tải lại dashboard, chỉ khôi phục kết nối nếu người dùng đã chủ động kết nối
 * trước đó và chưa nhấn ngắt kết nối.
 *
 * Quy trình kết nối:
 *   1. Kiểm tra window.ethereum (MetaMask extension phải được cài)
 *   2. Yêu cầu MetaMask mở khóa (nếu cần) và người dùng chọn tài khoản, xác nhận
 *   3. Lấy mạng hiện tại MetaMask đang chọn
 *   4. Nếu user đã có wallet_address trong DB → kiểm tra địa chỉ có khớp không
 *      - Không khớp → báo lỗi, connect thất bại
 *      - Khớp       → connect thành công (không gọi API lại)
 *   5. Nếu user chưa có wallet_address → lưu địa chỉ mới vào DB
 */
export const WalletConnectButton = ({ user, onWalletConnected }) => {
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [connectedChainId, setConnectedChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const userRef = useRef(user);
  const onWalletConnectedRef = useRef(onWalletConnected);
  const explicitConnectInProgress = useRef(false);

  const getConnectionErrorMessage = (error) => {
    if (error.code === 4001) {
      return 'Bạn đã từ chối yêu cầu kết nối hoặc chuyển mạng trong MetaMask.';
    }
    if (error.code === -32002) {
      return 'MetaMask đang có yêu cầu chờ xử lý. Vui lòng mở MetaMask, đăng nhập và hoàn tất yêu cầu trước đó.';
    }
    if (error.message && error.message.includes("reading 'origin'")) {
      return 'MetaMask gặp lỗi khi xác nhận quyền cho website nên ứng dụng chưa kết nối ví. Hãy cập nhật MetaMask hoặc ngắt kết nối website trong Connected sites rồi thử lại.';
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

    const ethereum = getMetaMaskProvider();
    if (!ethereum) throw new Error('Không tìm thấy MetaMask. Vui lòng cài đặt hoặc bật tiện ích MetaMask.');
    const chainId = await ethereum.request({ method: 'eth_chainId' });

    if (!currentUser || !currentUser.wallet_address) {
      const response = await api.connectWallet(normalizedAddress);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Không thể lưu địa chỉ ví vào tài khoản. Vui lòng thử lại.');
      }

      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('user_profile_updated'));
      userRef.current = response.user;
      localStorage.setItem(getWalletConnectionPreferenceKey(normalizedAddress), 'true');
      setConnectedAddress(normalizedAddress);
      setConnectedChainId(chainId);
      setSuccessMessage('Kết nối ví thành công!');
      onWalletConnectedRef.current?.(response.user);
      return;
    }

    localStorage.setItem(getWalletConnectionPreferenceKey(normalizedAddress), 'true');
    setConnectedAddress(normalizedAddress);
    setConnectedChainId(chainId);
    setSuccessMessage('Kết nối ví thành công!');
    onWalletConnectedRef.current?.({ ...currentUser, wallet_address: normalizedAddress });
  };

  useEffect(() => {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) return;

    let active = true;
    const handleAccountsChanged = async (accounts) => {
      if (explicitConnectInProgress.current) return;
      const registeredWallet = userRef.current?.wallet_address;
      if (!registeredWallet || localStorage.getItem(getWalletConnectionPreferenceKey(registeredWallet)) !== 'true') {
        return;
      }

      if (!accounts || accounts.length === 0) {
        setConnectedAddress(null);
        setConnectedChainId(null);
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
        setConnectedChainId(null);
        setErrorMessage(getConnectionErrorMessage(error));
      } finally {
        setConnecting(false);
      }
    };

    const handleChainChanged = (chainId) => {
      if (explicitConnectInProgress.current) return;
      setConnectedChainId(chainId);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    const registeredWallet = userRef.current?.wallet_address;
    const shouldRestoreConnection = registeredWallet
      && localStorage.getItem(getWalletConnectionPreferenceKey(registeredWallet)) === 'true';

    if (shouldRestoreConnection) {
      setConnecting(true);
      ethereum.request({ method: 'eth_accounts' })
        .then(async (accounts) => {
          if (!active || !accounts || accounts.length === 0) return;

          const normalizedAddress = getAddress(accounts[0]);
          const savedAddress = getAddress(registeredWallet);
          if (normalizedAddress.toLowerCase() !== savedAddress.toLowerCase()) {
            throw new Error(
              `Không thể khôi phục kết nối: địa chỉ ví MetaMask không khớp với tài khoản đang đăng nhập.\n` +
              `Ví đang chọn: ${normalizedAddress.slice(0, 10)}...${normalizedAddress.slice(-6)}\n` +
              `Ví đã đăng ký: ${savedAddress.slice(0, 10)}...${savedAddress.slice(-6)}\n` +
              'Vui lòng chuyển sang đúng tài khoản MetaMask.'
            );
          }

          const chainId = await ethereum.request({ method: 'eth_chainId' });
          if (!active) return;
          setConnectedAddress(normalizedAddress);
          setConnectedChainId(chainId);
          setErrorMessage('');
          setSuccessMessage('Đã khôi phục kết nối ví MetaMask.');
        })
        .catch((error) => {
          if (active) {
            setConnectedAddress(null);
            setConnectedChainId(null);
            setErrorMessage(getConnectionErrorMessage(error));
          }
        })
        .finally(() => {
          if (active) setConnecting(false);
        });
    }

    return () => {
      active = false;
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const handleConnect = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const ethereum = getMetaMaskProvider();
    if (!ethereum) {
      setErrorMessage(
        'Không tìm thấy MetaMask. Vui lòng cài đặt extension MetaMask trên trình duyệt và thử lại.'
      );
      return;
    }

    setConnecting(true);
    explicitConnectInProgress.current = true;
    try {
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask chưa cung cấp tài khoản. Vui lòng chọn một tài khoản để kết nối.');
      }

      await connectAccount(accounts[0], true);
    } catch (error) {
      setErrorMessage(getConnectionErrorMessage(error));
    } finally {
      explicitConnectInProgress.current = false;
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const address = connectedAddress || userRef.current?.wallet_address;
    if (address) {
      localStorage.removeItem(getWalletConnectionPreferenceKey(address));
    }
    setConnectedAddress(null);
    setConnectedChainId(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  // ── Đã kết nối trong phiên này → hiển thị WalletStatusCard ──
  if (connectedAddress) {
    return (
      <WalletStatusCard
        walletAddress={connectedAddress}
        chainId={connectedChainId}
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
export const WalletStatusCard = ({ walletAddress, chainId, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!walletAddress) return null;
  const network = getWalletNetwork(chainId);

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
        <div><span>Mạng lưới:</span><strong>{network.name}</strong></div>
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
      {network.explorerUrl && (
        <a
          className="wallet-status-details-link"
          href={`${network.explorerUrl}/address/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt style={{ fontSize: 10 }} /> Xem trên Etherscan
        </a>
      )}
    </section>
  );
};
