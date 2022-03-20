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
  const [collectionLoadState, setCollectionLoadState] = useState<any>({});
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [allCollectionsLoaded, setAllCollectionsLoaded] = useState(false);

  const [view, setView] = useState('');

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
      const collectionLoadState: any = {};

      setAllCollectionsLoaded(false);
      setLoadingNfts(true);

      for (const collection of COLLECTIONS) {
        const nftContract = new web3.eth.Contract(nftContractABI, collection.address);

        const totalSupply = await nftContract.methods.totalSupply().call();

        collectionLoadState[collection.name] = {
          loading: true,
          balance: Number(totalSupply),
        };

        setCollectionLoadState(collectionLoadState);

        for (let i = 0; i < totalSupply; i++) {
          const tokenMetadataUri = await nftContract.methods.tokenURI(i).call();
          const nftMetadata: any = (await superagent.get(tokenMetadataUri)).body;

          const nftList: Nft[] | any = nftMap[collection.name] ? [...nftMap[collection.name]] : [];

          nftList.push({
            collection: collection.name,
            image: nftMetadata.image,
            name: nftMetadata.name,
            description: nftMetadata.description,
            category: 'Art',
          });

          nftMap[collection.name] = [...nftList];
        }

        collectionLoadState[collection.name].loading = false;
        setCollectionLoadState({ ...collectionLoadState });
        setNfts({ ...nftMap });

        if (totalSupply > 0) {
          setLoadingNfts(false);
        }
      }

      setAllCollectionsLoaded(true);
      setLoadingNfts(false);
    }

    fetchNfts();
  }, []);

  const renderCollections = () => {
    const collectionListEl: any[] = [];

    Object.keys(collectionLoadState).forEach((key) => {
      if (collectionLoadState[key] && collectionLoadState[key].balance > 0) {
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

          collectionListEl.push(
            <ExploreNFTList
              loadingCount={collectionLoadState[key].balance}
              key={uuid()}
              nfts={nfts[key]}
              isDefault={false}
            />
          );
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

            collectionListEl.push(
              <ExploreNFTList
                key={uuid()}
                loadingCount={collectionLoadState[key].balance}
                nfts={nfts[key]}
                isDefault={false}
              />
            );
          } else if (view === '') {
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

            collectionListEl.push(
              <ExploreNFTList
                key={uuid()}
                loadingCount={collectionLoadState[key].balance}
                nfts={nfts[key]}
                isDefault={false}
              />
            );
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
    <Page title="Explore NFTs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Explore NFTs
        </Typography>
        {allCollectionsLoaded ? renderCollectionsFilters() : ''}
        {loadingNfts ? <ExploreNFTList nfts={[]} isDefault={true} /> : renderCollections()}
      </Container>
    </Page>
  );
}
