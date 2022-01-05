import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import useMetaMask from './useMetaMask';
import useENSName from './useENSName';
import { UserRejectedRequestError } from '@web3-react/injected-connector';
import { injected } from '../connectors';

type AccountProps = {
  triedToEagerConnect: boolean;
};

const useWallet = ({ triedToEagerConnect }: AccountProps) => {
  const { active, error, activate, chainId, account, setError } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available, startOnboarding, stopOnboarding } = useMetaMask();

  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  const ENSName = useENSName(account);

  if (error) {
    return { error: null };
  }

  if (!triedToEagerConnect) {
    return { triedToEagerConnect: null };
  }

  if (typeof account !== 'string') {
    return {
      account: null,
      isWeb3Available,
      isMetaMaskInstalled,
      onClick: isWeb3Available
        ? () => {
            setConnecting(true);

            activate(injected, undefined, true).catch((error) => {
              // ignore the error if it's a user rejected request
              if (error instanceof UserRejectedRequestError) {
                setConnecting(false);
              } else {
                setError(error);
              }
            });
          }
        : startOnboarding,
    };
  }

  const href = {
    href: formatEtherscanLink('Account', [chainId ? chainId : 1, account]),
    target: '_blank',
    rel: 'noopener noreferrer',
  };
  const address = ENSName || `${shortenHex(account, 4)}`;

  return { href, address };
};

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

const ETHERSCAN_PREFIXES = {
  1: '',
  338: 'tcro.',
};

function formatEtherscanLink(type: 'Account' | 'Transaction', data: [number, string]) {
  switch (type) {
    case 'Account': {
      const [chainId, address] = data;
      // @ts-ignore
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/address/${address}`;
    }
    case 'Transaction': {
      const [chainId, hash] = data;
      // @ts-ignore
      return `https://${ETHERSCAN_PREFIXES[chainId]}etherscan.io/tx/${hash}`;
    }
  }
}

export default useWallet;
