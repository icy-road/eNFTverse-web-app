import { Wallet } from '../../@types/wallet';
import { createContext, ReactNode, useState } from 'react';
import { useWeb3React } from "@web3-react/core";

export type WalletContextProps = {
  walletConnected: boolean;
  connectWallet: VoidFunction;
  disconnectWallet: VoidFunction;
};

const initialState: WalletContextProps = {
  walletConnected: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
};

const WalletContext = createContext(initialState);

type WalletProviderProps = {
  children: ReactNode;
};

function WalletContextProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet>();

  const { active, error, activate, chainId, account, setError } =
      useWeb3React();
  console.log({ active, error, activate, chainId, account, setError })

  const connectWallet = () => {
    //TODO: CONNECT WALLET then setWallet(connectedWallet);
    console.log('connect wallet')
    // setWallet({ walletConnected: true, connectedAddress: account, web3: library});
  };

  const disconnectWallet = () => {
    //TODO: DISCONNECT FROM METAMASK OR CRYPTO COM EXTENSION

    setWallet(undefined);
  };

  return (
    <WalletContext.Provider
      value={{
        walletConnected: !!wallet,
        connectWallet: connectWallet,
        disconnectWallet: disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export { WalletContextProvider, WalletContext };
