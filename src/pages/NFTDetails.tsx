import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { Box, Card, Container, Grid, Typography } from '@mui/material';
import SkeletonNft from '../components/skeleton/SkeletonNft';
import Image from '../components/Image';
import ProductDetailsSummary from 'src/sections/@dashboard/e-commerce/product/ProductDetailsSummary';
import {Product} from "../@types/product";


export default function NFTDetails() {
  const { themeStretch } = useSettings();
  const [value, setValue] = useState('1');
  const { id = '' } = useParams();
  const [product, setProduct] = useState({} as Product);

  return (
    <Page title="NFT Details">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <Typography variant="h3" component="h1" paragraph>
          NFT Details
        </Typography>

        {product && (
          <>
            <Card>
              <Grid container>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ p: 1 }}>
                    <Box
                      sx={{ zIndex: 0, borderRadius: 2, overflow: 'hidden', position: 'relative' }}
                    >
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
                <Grid item xs={12} md={6} lg={5}>
                  <ProductDetailsSummary product={product} />
                </Grid>
              </Grid>
            </Card>
          </>
        )}

        {!product && <SkeletonNft />}
      </Container>
    </Page>
  );
}
