import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import * as Yup from 'yup';

import useENSName from '../hooks/useENSName';
import { COLLECTIONS, EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../api/config';
import Web3 from 'web3';
import { ExploreNFTList } from '../sections/@dashboard/explore';
import { Alert, LoadingButton } from '@mui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import Image from '../components/Image';
import { Nft } from '../@types/nft';
import { uuid } from '../utils/helper';
import { useTheme } from '@mui/material/styles';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function OwnedNFTs() {
  const theme = useTheme();
  const { themeStretch } = useSettings();

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const ENSName = useENSName(account);

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  const [marketPlaceApproved, setMarketPlaceApproved] = useState<any>({});

  const [loadingNfts, setLoadingNfts] = useState(false);
  const [collectionLoadState, setCollectionLoadState] = useState<any>({});

  const [nfts, setNfts] = useState<any>({});

  const [nftCount, setNftCount] = useState(0);

  const [listing, setListing] = useState(false);

  const [openListNftDialog, setOpenListNftDialog] = useState(false);
  const [pendingEnabling, setPendingEnabling] = useState(false);

  const [selectedNft, setSelectedNft] = useState<Nft>({} as Nft);

  const NewProductSchema = Yup.object().shape({
    price: Yup.number().min(0.1).required('Price is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      price: 0,
    },
    validationSchema: NewProductSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      if (library) {
        setListing(true);
        const metamaskAddress = ENSName || account ? account : null;

        try {
          const listNFTForSaleAbi = await marketPlaceContract.methods
            .listNFTForSale(
              selectedNft.address,
              selectedNft.id,
              web3.utils.toWei(values.price.toString(), 'ether')
            )
            .encodeABI();
          const params = {
            from: metamaskAddress,
            to: marketplaceAddress,
            data: listNFTForSaleAbi,
          };
          await library.estimateGas(params);

          // @ts-ignore
          await window.ethereum.enable();
          // @ts-ignore
          window.web3 = new Web3(window.ethereum);

          // @ts-ignore
          window.web3.eth
            .sendTransaction(params)
            .on('transactionHash', async (txHash: any) => {
              console.log('txHash:');
              console.log(txHash);
              window.open(`${EXPLORER_URL}/tx/${txHash}/`);
              resetForm();
              setOpenListNftDialog(false);

              const newNfts = {...nfts}

              const newNftArray = [...newNfts[selectedNft.collection]]

              newNfts[selectedNft.collection] = newNftArray.filter((nft) => nft.id !== selectedNft.id)

              setNfts(newNfts)
              setListing(false);
            })
            .catch((err: any) => {
              console.log(err);
              setListing(false);
            });
        } catch (e) {
          console.log(e);
        }
      }
    },
  });

  const { errors, touched, handleSubmit, getFieldProps, resetForm } = formik;

  const enableMarketplace = async (collectionName: string, collectionAddress: string) => {
    setPendingEnabling(true);

    const nftContract = new web3.eth.Contract(nftContractABI, collectionAddress);

    const approveForAllAbi = await nftContract.methods
      .setApprovalForAll(marketplaceAddress, true)
      .encodeABI();

    const metamaskAddress = ENSName || account ? account : null;

    const params = {
      from: metamaskAddress,
      to: collectionAddress,
      data: approveForAllAbi,
    };

    await library.estimateGas(params);

    // @ts-ignore
    await window.ethereum.enable();
    // @ts-ignore
    window.web3 = new Web3(window.ethereum);

    // @ts-ignore
    window.web3.eth
      .sendTransaction(params)
      .on('transactionHash', async (txHash: any) => {
        window.open(`${EXPLORER_URL}/tx/${txHash}/`);

        setPendingEnabling(false);
        const updateMarketplaceApproval = { ...marketPlaceApproved };

        updateMarketplaceApproval[collectionName] = {
          address: collectionAddress,
          approved: true,
        };

        setMarketPlaceApproved(updateMarketplaceApproval);
      })
      .catch((err: any) => {
        console.log(err);
        setPendingEnabling(false);
      });
  };

  async function checkIfMarketplaceEnabled() {
    if (account) {
      setLoadingNfts(true);
      const nftMap: any = {};
      const approvalMap: any = {};
      const collectionLoadState: any = {};

      const metamaskAddress = ENSName || account ? account : null;

      for (const collection of COLLECTIONS) {
        const nftContract = new web3.eth.Contract(nftContractABI, collection.address);

        const isApprovedResponse = await nftContract.methods
          .isApprovedForAll(metamaskAddress, marketplaceAddress)
          .call();

        approvalMap[collection.name] = {
          address: collection.address,
          approved: isApprovedResponse,
        };

        setMarketPlaceApproved({ ...approvalMap });

        const balanceNfts = await nftContract.methods.balanceOf(metamaskAddress).call();

        collectionLoadState[collection.name] = {
          loading: true,
          balance: Number(balanceNfts),
        };

        setCollectionLoadState(collectionLoadState);
        setNftCount((prevState) => {
          return prevState + Number(balanceNfts);
        });

        for (let index = 0; index < balanceNfts; index++) {
          const nftId = await nftContract.methods
            .tokenOfOwnerByIndex(metamaskAddress, index)
            .call();

          const nftAddress = await nftContract.methods.tokenURI(nftId).call();

          const nftMetadata: any = (await superagent.get(nftAddress)).body;

          const nftList: Nft[] | any = nftMap[collection.name] ? [...nftMap[collection.name]] : [];

          nftList.push({
            id: nftId,
            address: collection.address,
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

        if (balanceNfts > 0) {
          setLoadingNfts(false);
        }
      }

      setLoadingNfts(false);
    }
  }

  useEffect(() => {
    checkIfMarketplaceEnabled();
  }, [account]);

  function prepareListForSale(nft: Nft) {
    setSelectedNft(nft);
    setOpenListNftDialog(true);
  }

  const renderNfts = () => {
    const collectionListEl: any[] = [];

    Object.keys(collectionLoadState).forEach((key) => {
      if (collectionLoadState[key] && collectionLoadState[key].balance > 0) {
        collectionListEl.push(
          <Box
              key={uuid()}
            sx={{
              mt: 2,
            }}
          >
            <Typography key={uuid()} variant="h5" component="h5" paragraph>
              {key}
            </Typography>
          </Box>
        );

        if (marketPlaceApproved[key] && !marketPlaceApproved[key].approved) {
          collectionListEl.push(
            <Box
                key={uuid()}
              sx={{
                mb: 2,
              }}
            >
              <Alert
                severity="warning"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
                  }}
                >
                  <Typography>{`Please enable ${key} on marketplace in order to list NFTs.`}</Typography>
                  <LoadingButton
                    sx={{
                      ml: 1,
                    }}
                    disabled={!isMetaMaskInstalled || !isWeb3Available}
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      enableMarketplace(key, marketPlaceApproved[key].address);
                    }}
                    loading={pendingEnabling}
                  >
                    Enable marketplace
                  </LoadingButton>
                </Box>
              </Alert>
            </Box>
          );
        }

        if (collectionLoadState[key] && !collectionLoadState[key].loading) {
          collectionListEl.push(
            <ExploreNFTList
              key={uuid()}
              forListing={marketPlaceApproved[key] ? marketPlaceApproved[key].approved : false}
              loadingCount={4}
              nfts={nfts[key]}
              prepareListForSale={prepareListForSale}
              isDefault={false}
            />
          );
        } else {
          collectionListEl.push(
            <ExploreNFTList
              key={uuid()}
              forListing={false}
              loadingCount={collectionLoadState[key].balance ?? 5}
              isDefault={true}
              nfts={[]}
            />
          );
        }
      }
    });

    return <Box>{collectionListEl}</Box>;
  };

  return (
    <Page title="Owned NFTs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          Owned NFTs
        </Typography>
        {!isMetaMaskInstalled ||
        !isWeb3Available ||
        typeof account !== 'string' ||
        nftCount === 0 ? (
          <Box
            sx={{
              position: 'relative',
              mt: 1,
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
                  {nftCount === 0 &&
                  isMetaMaskInstalled &&
                  isWeb3Available &&
                  typeof account === 'string'
                    ? 'No NFTs'
                    : 'Please connect metamask to see your minted NFTs.'}
                </Typography>
              )}
            </Backdrop>
            <ExploreNFTList forListing={false} loadingCount={4} isDefault={true} nfts={[]} />
          </Box>
        ) : (
          renderNfts()
        )}
        <Dialog
          fullWidth={true}
          open={openListNftDialog}
          onClose={() => {
            if (!listing) {
              setOpenListNftDialog(false);
            }
          }}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            <Typography variant="h5">{'Sell NFT'}</Typography>
          </DialogTitle>
          <DialogContent>
            <FormikProvider value={formik}>
              <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
                <Stack
                  spacing={3}
                  sx={{
                    pt: 3,
                  }}
                >
                  <Image
                    alt="file preview"
                    src={''}
                    sx={{
                      top: 8,
                      borderRadius: 1,
                      objectFit: 'cover',
                      position: 'absolute',
                      width: 'calc(100% - 24px)',
                      height: 'calc(100% - 24px)',
                    }}
                  />
                  <TextField
                    color="secondary"
                    label="Price*"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    {...getFieldProps('price')}
                    error={Boolean(touched.price && errors.price)}
                  />

                  <Stack direction="row" spacing={5}>
                    {!listing ? (
                      <Button
                        variant="contained"
                        fullWidth
                        color="error"
                        onClick={() => {
                          resetForm();
                          setOpenListNftDialog(false);
                        }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      ''
                    )}
                    <LoadingButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      loading={listing}
                    >
                      {'Set for Sale'}
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Form>
            </FormikProvider>
          </DialogContent>
        </Dialog>
      </Container>
    </Page>
  );
}
