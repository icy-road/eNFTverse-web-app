import { Wallet } from '../../@types/wallet';
import { createContext, ReactNode, useState } from 'react';

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

  const connectWallet = () => {
    //TODO: CONNECT WALLET then setWallet(connectedWallet);
    setWallet({});
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
