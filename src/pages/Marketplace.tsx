import React, {useEffect, useState} from 'react';

import { Container, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';


import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const [products, setProducts] = useState<Product[]>([])

  return (
    <Page title="Marketplace">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Marketplace
        </Typography>
        <ShopProductList isDefault={true} products={products} />
      </Container>
    </Page>
  );
}
