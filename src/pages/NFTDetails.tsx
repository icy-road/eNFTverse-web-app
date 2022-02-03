import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { Box, Card, CircularProgress, Container, Grid, Skeleton, Typography } from '@mui/material';
import SkeletonNft from '../components/skeleton/SkeletonNft';
import Image from '../components/Image';
import ProductDetailsSummary from 'src/sections/@dashboard/e-commerce/product/ProductDetailsSummary';
import { Product } from '../@types/product';
import { CONTRACT_ADDRESS, WEB3_PROVIDER } from '../api/config';
import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import ProgressBar from '../components/ProgressBar';

const nftContractABI = require('../utils/NFTContract.json');

const superagent = require('superagent');

export default function NFTDetails() {
  const { themeStretch } = useSettings();
  const [value, setValue] = useState('1');
  const { id = '' } = useParams();
  const [product, setProduct] = useState({} as Product);

  const nftContractAddress = CONTRACT_ADDRESS;

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  useEffect(() => {
    async function fetchNftDetails() {
      const nftAddress = await nftContract.methods.tokenURI(id).call();

      const nftMetadata: any = (await superagent.get(nftAddress)).body;

      setProduct({
        nftId: id,
        contractAddress: nftContractAddress ?? '',
        author: nftAddress.author,
        image: nftMetadata.image,
        name: nftMetadata.name,
        price: 25,
        priceSale: null,
        status: 'sale',
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
                <ProductDetailsSummary product={product} />
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
