import React, { useEffect, useState } from 'react';

import { Container, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';

import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import Web3 from 'web3';
import useENSName from '../hooks/useENSName';
import { CONTRACT_ADDRESS, EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../api/config';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const { account, library } = useWeb3React();

  const [products, setProducts] = useState<Product[]>([]);

  const ENSName = useENSName(account);

  const nftContractAddress = CONTRACT_ADDRESS;

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  useEffect(() => {
    async function checkIfMarketplaceEnabled() {
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

    checkIfMarketplaceEnabled();
  }, [account]);

  return (
    <Page title="Marketplace">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Marketplace
        </Typography>
        <ShopProductList loadingCount={4} isDefault={true} products={products} />
      </Container>
    </Page>
  );
}
