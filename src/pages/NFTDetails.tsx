import React, { useEffect, useState } from 'react';

import { sentenceCase } from 'change-case';
import { useParams } from 'react-router-dom';

import { alpha, styled } from '@mui/material/styles';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import { Box, Card, Container, Divider, Grid, Tab, Typography } from '@mui/material';
import SkeletonNft from '../components/skeleton/SkeletonNft';
import { sampleProducts } from './Marketplace';
import Iconify from '../components/Iconify';
import Image from '../components/Image';
import ProductDetailsSummary from 'src/sections/@dashboard/e-commerce/product/ProductDetailsSummary';

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  justifyContent: 'center',
  height: theme.spacing(8),
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  backgroundColor: `${alpha(theme.palette.primary.main, 0.08)}`,
}));

export default function NFTDetails() {
  const { themeStretch } = useSettings();
  const [value, setValue] = useState('1');
  const { id = '' } = useParams();
  const [product, setProduct] = useState(sampleProducts[0]);

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
