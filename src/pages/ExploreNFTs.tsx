import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import Page from '../components/Page';
import useSettings from '../hooks/useSettings';
import Web3 from 'web3';
import { Product } from '../@types/product';
import { Nft } from '../@types/nft';
import { ExploreNFTList } from '../sections/@dashboard/explore';

const nftContractABI = require('../utils/NFTContract.json');
const superagent = require('superagent');

export default function ExploreNFTs() {
  const { themeStretch } = useSettings();

  const [nfts, setNfts] = useState<Nft[]>([]);

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

    const newNfts: Nft[] = [];

    for (let i = 0; i < totalSupply; i++) {
      const tokenMetadataUri = await nftContract.methods.tokenURI(i).call();
      const nftMetadata: any = (await superagent.get(tokenMetadataUri)).body;

      newNfts.push({
        image: nftMetadata.image,
        name: nftMetadata.name,
        description: nftMetadata.description,
        category: 'Art',
      });
    }

    setNfts(newNfts);
  }

  return (
    <Page title="Explore NFTs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Explore NFTs
        </Typography>
        <ExploreNFTList nfts={nfts} isDefault={true} />
      </Container>
    </Page>
  );
}
