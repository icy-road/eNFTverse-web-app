import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { Box, Card, CircularProgress, Container, Grid, Skeleton, Typography } from '@mui/material';
import SkeletonNft from '../components/skeleton/SkeletonNft';
import Image from '../components/Image';
import ProductDetailsSummary from 'src/sections/@dashboard/e-commerce/product/ProductDetailsSummary';
import { Product } from '../@types/product';
import {CONTRACT_ADDRESS, EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER} from '../api/config';
import Web3 from 'web3';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function NFTDetails() {
  const { themeStretch } = useSettings();
  const { id = '', contractAddress = CONTRACT_ADDRESS } = useParams();
  const [product, setProduct] = useState({} as Product);

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const web3 = new Web3(WEB3_PROVIDER ?? '');
  const nftContract = new web3.eth.Contract(nftContractABI, contractAddress);
  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  useEffect(() => {
    async function fetchNftDetails() {
      const nftAddress = await nftContract.methods.tokenURI(id).call();

      const nftMetadata: any = (await superagent.get(nftAddress)).body;

      const marketPlaceItem = await marketPlaceContract.methods
          .getMarketplaceItemByNFT(contractAddress, id)
          .call();

      console.log(marketPlaceItem)

      setProduct({
        nftId: id,
        contractAddress: contractAddress ?? '',
        author: nftAddress.author,
        image: nftMetadata.image,
        name: nftMetadata.name,
        price: marketPlaceItem.price,
        priceSale: null,
        status: marketPlaceItem.price >0 ? 'sale' : 'sold',
        description: nftMetadata.description,
        category: 'Art',
      });
    }

    fetchNftDetails();
  }, []);

  return (
    <Page title="NFT Details">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Typography variant="h3" component="h1" paragraph>
          NFT Details
        </Typography>

        <Card>
          <Grid container>
            <Grid item xs={12} md={6} lg={7}>
              <Box sx={{ p: 1 }}>
                <Box sx={{ zIndex: 0, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  <Image
                    key={product.image}
                    alt="large image"
                    src={product.image}
                    ratio="1/1"
                    sx={{ cursor: 'zoom-in' }}
                  />
                </Box>
              </Box>
            </Grid>

            {product.nftId ? (
              <Grid item xs={12} md={6} lg={5}>
                <ProductDetailsSummary product={product} contractAddress={contractAddress} />
              </Grid>
            ) : (
              <Grid
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                item
                xs={12}
                md={6}
                lg={5}
              >
                <CircularProgress size={32} />
              </Grid>
            )}
          </Grid>
        </Card>
      </Container>
    </Page>
  );
}
