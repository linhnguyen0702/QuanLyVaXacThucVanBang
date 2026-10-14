import React, { useState } from 'react';
import { FaShieldAlt, FaWallet, FaSpinner } from 'react-icons/fa';
import { getAddress } from 'ethers';
import { Navigate } from 'react-router-dom';
import { api } from '../../services/api';
import './WalletConnection.css';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

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

export const WalletConnectionGate = ({ user, onWalletConnected, children }) => {
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    setErrorMessage('');
    if (!window.ethereum) {
      setErrorMessage('Không tìm thấy MetaMask. Vui lòng cài đặt hoặc mở trình duyệt có ví MetaMask.');
      return;
    }

    setConnecting(true);
    try {
      await ensureSepoliaNetwork(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('MetaMask chưa cung cấp tài khoản ví. Vui lòng chọn một tài khoản để kết nối.');
      }

      const walletAddress = getAddress(accounts[0]);
      const response = await api.connectWallet(walletAddress);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Không thể lưu địa chỉ ví vào tài khoản.');
      }

      localStorage.setItem('user', JSON.stringify(response.user));
      window.dispatchEvent(new Event('user_profile_updated'));
      onWalletConnected(response.user);
    } catch (error) {
      if (error.code === 4001) {
        setErrorMessage('Bạn đã từ chối yêu cầu kết nối ví. Hãy chấp thuận trên MetaMask để tiếp tục.');
      } else {
        setErrorMessage(error.message || 'Không thể kết nối hoặc lưu ví. Vui lòng thử lại.');
      }
    } finally {
      setConnecting(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.wallet_address) return children;

  return (
    <main className="wallet-connect-page">
      <section className="wallet-connect-panel">
        <div className="wallet-connect-icon"><FaShieldAlt /></div>
        <h1>Kết nối ví Blockchain</h1>
        <p>
          Để tiếp tục vào hệ thống, hãy kết nối ví MetaMask với mạng Ethereum Sepolia.
          Mỗi tài khoản chỉ được liên kết với một địa chỉ ví duy nhất.
        </p>
        <button type="button" onClick={handleConnect} disabled={connecting}>
          {connecting ? <FaSpinner className="wallet-connect-spinner" /> : <FaWallet />}
          {connecting ? 'Đang kết nối...' : 'Connect ví MetaMask'}
        </button>
        {errorMessage && <div className="wallet-connect-error" role="alert">{errorMessage}</div>}
      </section>
    </main>
  );
};

export const WalletStatusCard = ({ walletAddress }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

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
      </div>
      <div className="wallet-status-details">
        <div><span>Mạng lưới:</span><strong>Ethereum Sepolia</strong></div>
        <div>
          <span>Địa chỉ ví:</span>
          <button type="button" onClick={handleCopy} title="Bấm để sao chép">
            {copied ? 'Đã copy!' : `${walletAddress.slice(0, 10)}...`}
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
        Xem chi tiết
      </a>
    </section>
  );
};
