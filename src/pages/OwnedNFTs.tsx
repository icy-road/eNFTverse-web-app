import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import React, { useEffect, useState } from 'react';
import { Backdrop, Box, CircularProgress, Container, Typography } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import { ShopProductList } from '../sections/@dashboard/e-commerce/shop';
import useENSName from '../hooks/useENSName';
import { CONTRACT_ADDRESS, WEB3_PROVIDER } from '../api/config';
import Web3 from 'web3';
import {ExploreNFTList} from "../sections/@dashboard/explore";

const nftContractABI = require('../utils/NFTContract.json');

const superagent = require('superagent');

export default function OwnedNFTs() {
  const { themeStretch } = useSettings();

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const ENSName = useENSName(account);

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const nftContractAddress = CONTRACT_ADDRESS;

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const [loadingNfts, setLoadingNfts] = useState(false);

  const [nftList, setNftList] = useState<any>([])

  const [nftCount, setNftCount] = useState(0);

  useEffect(() => {
    async function checkIfMarketplaceEnabled() {
      if (account) {
        setLoadingNfts(true);
        const fetchedNfts = []
        const metamaskAddress = ENSName || account ? account : null;

        const balanceNfts = await nftContract.methods.balanceOf(metamaskAddress).call();

        setNftCount(balanceNfts);

        for (let index = 0; index < balanceNfts; index++) {
            const nftId = await nftContract.methods
                .tokenOfOwnerByIndex(metamaskAddress, index)
                .call();


            const nftAddress = await nftContract.methods
                .tokenURI(nftId)
                .call();

            const nftMetadata: any = (await superagent.get(nftAddress)).body;

            fetchedNfts.push({
                image: nftMetadata.image,
                name: nftMetadata.name,
                description: nftMetadata.description,
                category: 'Art',
            });

        }

        setNftList(fetchedNfts)
        setLoadingNfts(false);
      }
    }

    checkIfMarketplaceEnabled();
  }, [account]);

  return (
    <Page title="Owned NFTs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Owned NFTs
        </Typography>
        {!isMetaMaskInstalled || !isWeb3Available || typeof account !== 'string' || nftCount === 0 ? (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Backdrop
              sx={{
                position: 'absolute',
                background: 'white',
                opacity: '0.8!important',
                zIndex: 1,
                p: 2,
              }}
              open={true}
            >
              {loadingNfts ? (
                <CircularProgress />
              ) : (
                <Typography variant="h5" component="h5" paragraph>
                  {nftCount == 0 &&
                  isMetaMaskInstalled &&
                  isWeb3Available &&
                  typeof account === 'string'
                    ? 'No NFTs'
                    : 'Please connect metamask to see your minted NFTs.'}
                </Typography>
              )}
            </Backdrop>
            <ExploreNFTList loadingCount={4} isDefault={true} nfts={[]} />
          </Box>
        ) : (
          <ExploreNFTList loadingCount={4} isDefault={true} nfts={nftList} />
        )}
      </Container>
    </Page>
  );
}
