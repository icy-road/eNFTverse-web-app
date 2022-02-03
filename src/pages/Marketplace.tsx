import React, { useEffect, useState } from 'react';

import { Backdrop, Box, Container, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';

import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import Web3 from 'web3';
import useENSName from '../hooks/useENSName';
import { LoadingButton } from '@mui/lab';
import { CONTRACT_ADDRESS, EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../api/config';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const [products, setProducts] = useState<Product[]>([]);

  const [marketPlaceApproved, setMarketPlaceApproved] = useState(false);
  const [pendingEnabling, setPendingEnabling] = useState(false);

  const ENSName = useENSName(account);

  const nftContractAddress = CONTRACT_ADDRESS;

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  useEffect(() => {
    async function checkIfMarketplaceEnabled() {
      if (account) {
        const metamaskAddress = ENSName || account ? account : null;

        setPendingEnabling(true);

        const isApprovedResponse = await nftContract.methods
          .isApprovedForAll(metamaskAddress, marketplaceAddress)
          .call();

        setPendingEnabling(false);

        setMarketPlaceApproved(isApprovedResponse);

        const tokenCount = await marketPlaceContract.methods
          .getNumberOfItemsListedForContract(nftContractAddress)
          .call();

        const products: Product[] = [];

        if (tokenCount > 0) {
          try {
            const marketPlaceItems = await marketPlaceContract.methods
              .fetchMarketplaceItems(nftContractAddress, 0, tokenCount - 1)
              .call();

            for (const marketPlaceItem of marketPlaceItems) {
              const nftId = marketPlaceItem.tokenId;

              const nftAddress = await nftContract.methods.tokenURI(nftId).call();

              const nftMetadata: any = (await superagent.get(nftAddress)).body;

              products.push({
                nftId: nftId,
                contractAddress: nftContractAddress ?? '',
                author: nftAddress.author,
                image: nftMetadata.image,
                name: nftMetadata.name,
                price: marketPlaceItem.price,
                priceSale: null,
                status: 'sale',
                description: nftMetadata.description,
                category: 'Art',
              });
            }

            setProducts(products);
          } catch (e) {
            console.log(e);
          }
        }
      }
    }

    checkIfMarketplaceEnabled();
  }, [account]);

  const enableNFTs = async () => {
    setPendingEnabling(true);

    const approveForAllAbi = await nftContract.methods
      .setApprovalForAll(marketplaceAddress, true)
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
        window.open(`${EXPLORER_URL}/tx/${txHash}/`);

        setPendingEnabling(false);
        setMarketPlaceApproved(true);
      })
      .catch((err: any) => {
        console.log(err);
        setPendingEnabling(false);
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
          <ShopProductList loadingCount={4} isDefault={true} products={products} />
        )}
      </Container>
    </Page>
  );
}
