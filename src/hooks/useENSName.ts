import { useWeb3React } from '@web3-react/core';
import type { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';

export default function useENSName(address: string | null | undefined) {
  const { library, chainId } = useWeb3React<Web3Provider>();
  const [ENSName, setENSName] = useState('');

  useEffect(() => {
    if (library && typeof address === 'string') {
      let stale = false;

      library
        .lookupAddress(address)
        .then((name) => {
          if (!stale && typeof name === 'string') {
            setENSName(name);
          }
        })
        .catch(() => {});

      return () => {
        stale = true;
        setENSName('');
      };
    }
  }, [library, address, chainId]);

  return ENSName;
}
