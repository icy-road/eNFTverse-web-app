import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Page from '../components/Page';
import useSettings from '../hooks/useSettings';
import Web3 from 'web3';
import { Nft } from '../@types/nft';
import { ExploreNFTList } from '../sections/@dashboard/explore';
import { COLLECTIONS, WEB3_PROVIDER } from '../api/config';
import { uuid } from '../utils/helper';

const nftContractABI = require('../utils/NFTContract.json');
const superagent = require('superagent');

export default function ExploreNFTs() {
  const { themeStretch } = useSettings();

  const [nfts, setNfts] = useState<any>({});
  const [loadingNfts, setLoadingNfts] = useState(false);

  const [view, setView] = useState('Puss Coins');

  const handleChange = (event: any, nextView: React.SetStateAction<string>) => {
    if (!nextView) {
      setView('Puss Coins');
    } else {
      setView(nextView);
    }
  };

  useEffect(() => {
    async function fetchNfts() {
      const web3 = new Web3(WEB3_PROVIDER ?? '');

      const nftMap: any = {};

      setLoadingNfts(true);

      for (const collection of COLLECTIONS) {
        const nftContract = new web3.eth.Contract(nftContractABI, collection.address);

        const totalSupply = await nftContract.methods.totalSupply().call();

        for (let i = 0; i < totalSupply; i++) {
          const tokenMetadataUri = await nftContract.methods.tokenURI(i).call();
          const nftMetadata: any = (await superagent.get(tokenMetadataUri)).body;

          const nftList: Nft[] | any = nftMap[collection.name] ? [...nftMap[collection.name]] : [];

          nftList.push({
            image: nftMetadata.image,
            name: nftMetadata.name,
            description: nftMetadata.description,
            category: 'Art',
          });

          nftMap[collection.name] = [...nftList];
        }

        setNfts({ ...nftMap });

        if (totalSupply > 0) {
          setLoadingNfts(false);
        }
      }
    }

    fetchNfts();
  }, []);

  const renderCollections = () => {
    const collectionListEl: any[] = [];

    Object.keys(nfts).forEach((key) => {
      if (view === 'Puss Coins' && key !== 'Public') {
        collectionListEl.push(
          <Box
            sx={{
              mt: 2,
            }}
          >
            <Typography key={uuid()} variant="h5" component="h5" paragraph>
              {key}
            </Typography>
          </Box>
        );

        collectionListEl.push(<ExploreNFTList key={uuid()} nfts={nfts[key]} isDefault={false} />);
      } else {
        if (key === view) {
          collectionListEl.push(
            <Box
              sx={{
                mt: 2,
              }}
            >
              <Typography key={uuid()} variant="h5" component="h5" paragraph>
                {key}
              </Typography>
            </Box>
          );

          collectionListEl.push(<ExploreNFTList key={uuid()} nfts={nfts[key]} isDefault={false} />);
        }
      }
    });

    return <Box>{collectionListEl}</Box>;
  };

  const renderCollectionsFilters = () => {
    const toggleButtons: any[] = [];

    COLLECTIONS.forEach((collection) => {
      toggleButtons.push(
        <ToggleButton value={collection.name} aria-label={collection.name}>
          {collection.name}
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
    <Page title="Explore NFTs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Explore NFTs
        </Typography>
        {loadingNfts ? '' : renderCollectionsFilters()}
        {loadingNfts ? <ExploreNFTList nfts={[]} isDefault={true} /> : renderCollections()}
      </Container>
    </Page>
  );
}
