import React, { useEffect, useState } from 'react';

import { Box, Container, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';

import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';
import { useWeb3React } from '@web3-react/core';
import Web3 from 'web3';
import { COLLECTIONS, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../api/config';
import { uuid } from '../utils/helper';
import { ExploreNFTList } from '../sections/@dashboard/explore';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const [productsMap, setProductsMap] = useState<any>({});

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [collectionLoadState, setCollectionLoadState] = useState<any>({});

  const [allCollectionsLoaded, setAllCollectionsLoaded] = useState(false);

  const [view, setView] = useState('');

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  const handleChange = (event: any, nextView: React.SetStateAction<string>) => {
    if (!nextView) {
      setView('Puss Coins');
    } else {
      setView(nextView);
    }
  };

  useEffect(() => {
    async function fetchMarketplace() {
      const productsMap: any = {};
      const collectionLoadState: any = {};

      setLoadingProducts(true);
      for (const collection of COLLECTIONS) {
        const tokenCount = await marketPlaceContract.methods
          .getNumberOfItemsListedForContract(collection.address)
          .call();

        collectionLoadState[collection.name] = {
          loading: true,
          balance: Number(tokenCount),
        };

        setCollectionLoadState({ ...collectionLoadState });
      }

      for (const collection of COLLECTIONS) {
        const nftContract = new web3.eth.Contract(nftContractABI, collection.address);

        const tokenCount = collectionLoadState[collection.name].balance;

        const products: Product[] | any = productsMap[collection.name]
          ? [...productsMap[collection.name]]
          : [];

        if (tokenCount > 0) {
          try {
            const marketPlaceItems = await marketPlaceContract.methods
              .fetchMarketplaceItems(collection.address, 0, tokenCount - 1)
              .call();

            for (const marketPlaceItem of marketPlaceItems) {
              const nftId = marketPlaceItem.tokenId;

              const nftAddress = await nftContract.methods.tokenURI(nftId).call();

              const nftMetadata: any = (await superagent.get(nftAddress)).body;

              products.push({
                nftId: nftId,
                contractAddress: collection.address ?? '',
                author: nftAddress.author,
                image: nftMetadata.image,
                name: nftMetadata.name,
                price: marketPlaceItem.price,
                priceSale: null,
                status: 'sale',
                description: nftMetadata.description,
                category: 'Art',
              });

              productsMap[collection.name] = [...products];
            }
          } catch (e) {
            console.log(e);
          }

          setProductsMap({ ...productsMap });

          collectionLoadState[collection.name].loading = false;
          setCollectionLoadState({ ...collectionLoadState });

          if (tokenCount > 0) {
            setLoadingProducts(false);
          }
        }
      }

      setAllCollectionsLoaded(true);
      setLoadingProducts(false);
    }

    fetchMarketplace();
  }, []);

  const renderShopProducts = () => {
    const collectionListEl: any[] = [];

    Object.keys(collectionLoadState).forEach((key) => {
      if (collectionLoadState[key] && collectionLoadState[key].balance > 0) {
        if (view === 'Puss Coins' && key !== 'Public') {
          collectionListEl.push(
            <Box
              key={uuid()}
              sx={{
                mt: 2,
              }}
            >
              <Typography key={uuid()} variant="h5" component="h5" paragraph>
                {key}
              </Typography>
            </Box>
          );

          if (collectionLoadState[key] && !collectionLoadState[key].loading) {
            collectionListEl.push(
              <ShopProductList key={uuid()} isDefault={true} products={productsMap[key]} />
            );
          } else {
            collectionListEl.push(
              <ShopProductList
                key={uuid()}
                loadingCount={collectionLoadState[key].balance ?? 5}
                isDefault={true}
                products={[]}
              />
            );
          }
        } else {
          if (key === view) {
            collectionListEl.push(
              <Box
                key={uuid()}
                sx={{
                  mt: 2,
                }}
              >
                <Typography key={uuid()} variant="h5" component="h5" paragraph>
                  {key}
                </Typography>
              </Box>
            );

            if (collectionLoadState[key] && !collectionLoadState[key].loading) {
              collectionListEl.push(
                <ShopProductList key={uuid()} isDefault={true} products={productsMap[key]} />
              );
            } else {
              collectionListEl.push(
                <ShopProductList
                  key={uuid()}
                  loadingCount={collectionLoadState[key].balance ?? 5}
                  isDefault={true}
                  products={[]}
                />
              );
            }
          } else if (view === '') {
            collectionListEl.push(
              <Box
                key={uuid()}
                sx={{
                  mt: 2,
                }}
              >
                <Typography key={uuid()} variant="h5" component="h5" paragraph>
                  {key}
                </Typography>
              </Box>
            );

            if (collectionLoadState[key] && !collectionLoadState[key].loading) {
              collectionListEl.push(
                <ShopProductList key={uuid()} isDefault={true} products={productsMap[key]} />
              );
            } else {
              collectionListEl.push(
                <ShopProductList
                  key={uuid()}
                  loadingCount={collectionLoadState[key].balance ?? 5}
                  isDefault={true}
                  products={[]}
                />
              );
            }
          }
        }
      }
    });

    return <Box>{collectionListEl}</Box>;
  };

  const renderCollectionsFilters = () => {
    const toggleButtons: any[] = [];

    Object.keys(collectionLoadState).forEach((key) => {
      if (collectionLoadState[key] && collectionLoadState[key].balance > 0)
        toggleButtons.push(
          <ToggleButton value={key} aria-label={key}>
            {key}
          </ToggleButton>
        );
    });

    return (
      <ToggleButtonGroup value={view} exclusive onChange={handleChange} color={'primary'}>
        {toggleButtons}
      </ToggleButtonGroup>
    );
  };

  return (
    <Page title="Marketplace">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Marketplace
        </Typography>
        {allCollectionsLoaded ? renderCollectionsFilters() : ''}
        {loadingProducts ? <ExploreNFTList nfts={[]} isDefault={true} /> : renderShopProducts()}
      </Container>
    </Page>
  );
}
