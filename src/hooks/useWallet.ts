import { useContext } from 'react';
import { WalletContext } from '../contexts/wallet/WalletContext';

const useWallet = () => useContext(WalletContext);

export default useWallet;
