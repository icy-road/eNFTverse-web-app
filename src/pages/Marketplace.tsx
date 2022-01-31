import React, { useEffect, useState } from 'react';

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';

import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import Web3 from 'web3';
import useENSName from '../hooks/useENSName';
import { LoadingButton } from '@mui/lab';
import {Web3Provider} from "@ethersproject/providers";
import {EXPLORER_URL} from "../api/config";

const nftContractABI = require('../utils/NFTContract.json');

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const web3 = new Web3('https://cronos-testnet-3.crypto.org:8545');

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const [products, setProducts] = useState<Product[]>([]);

  const [marketPlaceApproved, setMarketPlaceApproved] = useState(false);
  const [pendingEnabling, setPendingEnabling] = useState(false);

  const ENSName = useENSName(account);

  const nftContractAddress = '0x94667a5A3042f3369033F9476bFf9A0E51f361d7';

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);


  useEffect(() => {
    async function checkIfMarketplaceEnabled() {
      if (account) {
        const metamaskAddress = ENSName || account ? account : null;

        const isApprovedResponse = await nftContract.methods
          .isApprovedForAll(metamaskAddress, nftContractAddress)
          .call();

        setMarketPlaceApproved(isApprovedResponse);
      }
    }

    checkIfMarketplaceEnabled();
  }, [account]);

  const enableNFTs = async () => {
    setPendingEnabling(true)

    const approveForAllAbi = await nftContract.methods
        .setApprovalForAll(nftContractAddress, true)
        .encodeABI();

    const metamaskAddress = ENSName || account ? account : null;

    const params = {
      from: metamaskAddress,
      to: nftContractAddress,
      data: approveForAllAbi,
    };

    const gasPrice = await library.estimateGas(params);

    // @ts-ignore
    await window.ethereum.enable();
    // @ts-ignore
    window.web3 = new Web3(window.ethereum);

    // @ts-ignore
    window.web3.eth
        .sendTransaction(params)
        .on('transactionHash', async (txHash: any) => {
          console.log('txHash:');
          console.log(txHash);
          window.open(`${EXPLORER_URL}/tx/${txHash}/`);

          setPendingEnabling(false)
          setMarketPlaceApproved(true);
        })
        .catch((err: any) => {
          console.log(err);
          setPendingEnabling(false)
        });
  };

  return (
    <Page title="Marketplace">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Marketplace
        </Typography>

        {!isMetaMaskInstalled ||
        !isWeb3Available ||
        typeof account !== 'string' ||
        !marketPlaceApproved ? (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Backdrop
              sx={{
                position: 'absolute',
                color: '#fff',
                background: 'white',
                opacity: '0.8!important',
                zIndex: 1,
                p: 2,
              }}
              open={true}
            >
              <LoadingButton
                disabled={
                  (!isMetaMaskInstalled || !isWeb3Available || typeof account !== 'string') &&
                  !marketPlaceApproved
                }
                variant="contained"
                color="secondary"
                onClick={enableNFTs}
                loading={pendingEnabling}
              >
                Enable eNFTverse NFTs on marketplace
              </LoadingButton>
            </Backdrop>
            <ShopProductList loadingCount={4} isDefault={true} products={[]} />
          </Box>
        ) : (
          <ShopProductList isDefault={true} products={products} />
        )}
      </Container>
    </Page>
  );
}
