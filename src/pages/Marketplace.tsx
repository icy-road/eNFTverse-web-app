import React, {useEffect, useState} from 'react';

import { Container, Typography } from '@mui/material';
import useSettings from '../hooks/useSettings';
import Page from '../components/Page';


import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import { Product } from '../@types/product';
import Web3 from 'web3';

const nftContractABI = require('../utils/NFTContract.json');
const superagent = require('superagent');

export default function Marketplace() {
  const { themeStretch } = useSettings();

  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchNfts();
  }, []);

  async function fetchNfts() {
    const web3 = new Web3('https://cronos-testnet-3.crypto.org:8545');
    const nftContract = new web3.eth.Contract(
        nftContractABI,
        '0x94667a5A3042f3369033F9476bFf9A0E51f361d7'
    );

    const totalSupply = await nftContract.methods.totalSupply().call();

    const newProducts : Product[] = []

    for (let i = 0; i < totalSupply; i++) {
      const tokenMetadataUri = await nftContract.methods.tokenURI(i).call();
      const nftMetadata : any = (await superagent.get(tokenMetadataUri)).body

      newProducts.push({
        nftId: i.toString(),
        contractAddress: '0x94667a5A3042f3369033F9476bFf9A0E51f361d7',
        image: nftMetadata.image,
        name: nftMetadata.name,
        price: 1000,
        priceSale: null,
        description: nftMetadata.description,
        status: 'sale',
        category: "Art"
      })

    }

    setProducts(newProducts)
  }


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
