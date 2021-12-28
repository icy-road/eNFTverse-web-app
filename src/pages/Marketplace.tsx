import React from "react";

import { Container, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';

import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import {Product} from "../@types/product";

export const sampleProducts: Product[] = [
  {
    id: '12341412',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_1.jpg',
    name: 'NFT_NAME_1',
    priceSale: 20.00,
    price: 16.19,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sapien sapien, ornare id semper et, gravida a nunc.',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  },
  {
    id: '12341413',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_2.jpg',
    name: 'NFT_NAME_2',
    price: 32,
    priceSale: null,
    description: 'Some fancy description',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  },
  {
    id: '12341414',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_3.jpg',
    name: 'NFT_NAME_3',
    price: 100,
    priceSale: null,
    description: 'Some fancy description',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  },
  {
    id: '12341415',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_4.jpg',
    name: 'NFT_NAME_5',
    price: 35,
    priceSale: null,
    description: 'Some fancy description',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  },
  {
    id: '12341416',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_5.jpg',
    name: 'NFT_NAME_6',
    price: 35,
    priceSale: null,
    description: 'Some fancy description',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  },
  {
    id: '12341417',
    image: 'https://minimal-assets-api.vercel.app/assets/images/products/product_6.jpg',
    name: 'NFT_NAME_7',
    price: 35,
    priceSale: null,
    description: 'Some fancy description',
    status: "sale",
    createdAt: '2021-12-21T10:13:54.053Z',
    category: 'Art'
  }
]

export default function Marketplace() {
  const { themeStretch } = useSettings();

  return (
    <Page title="Marketplace">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Marketplace
        </Typography>
        <ShopProductList isDefault={true} products={sampleProducts} />
      </Container>
    </Page>
  );
}
