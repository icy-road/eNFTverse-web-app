import useSettings from '../hooks/useSettings';
import Page from '../components/Page';
import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  getTableSortLabelUtilityClass,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../hooks/useMetaMaskOnboarding';
import * as Yup from 'yup';

import useENSName from '../hooks/useENSName';
import { CONTRACT_ADDRESS, EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../api/config';
import Web3 from 'web3';
import { ExploreNFTList } from '../sections/@dashboard/explore';
import { Alert, LoadingButton } from '@mui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import Image from '../components/Image';
import { Nft } from '../@types/nft';

const nftContractABI = require('../utils/NFTContract.json');
const marketplaceABI = require('../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function OwnedNFTs() {
  const { themeStretch } = useSettings();

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();

  const ENSName = useENSName(account);

  const web3 = new Web3(WEB3_PROVIDER ?? '');

  const nftContractAddress = CONTRACT_ADDRESS;

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  const [marketPlaceApproved, setMarketPlaceApproved] = useState(true);

  const [loadingNfts, setLoadingNfts] = useState(false);

  const [nftList, setNftList] = useState<any>([]);

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
              nftContractAddress,
              selectedNft.id,
              web3.utils.toWei(values.price.toString(), 'ether')
            )
            .encodeABI();
          const params = {
            from: metamaskAddress,
            to: marketplaceAddress,
            data: listNFTForSaleAbi,
          };
          const gasPrice = await library.estimateGas(params);

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

              const newNftArray = [...nftList];

              setNftList(newNftArray.filter((nft) => nft.id !== selectedNft.id));

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

  const { errors, values, touched, handleSubmit, setFieldValue, getFieldProps, resetForm } = formik;

  const enableMarketplace = async () => {
    setPendingEnabling(true);

    const approveForAllAbi = await nftContract.methods
      .setApprovalForAll(marketplaceAddress, true)
      .encodeABI();

    const metamaskAddress = ENSName || account ? account : null;

    const params = {
      from: metamaskAddress,
      to: nftContractAddress,
      data: approveForAllAbi,
    };

    const gasPrice = await library.estimateGas(params);

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
        setMarketPlaceApproved(true);
      })
      .catch((err: any) => {
        console.log(err);
        setPendingEnabling(false);
      });
  };

  async function checkIfMarketplaceEnabled() {
    if (account) {
      setLoadingNfts(true);
      const fetchedNfts = [];
      const metamaskAddress = ENSName || account ? account : null;

      const isApprovedResponse = await nftContract.methods
        .isApprovedForAll(metamaskAddress, marketplaceAddress)
        .call();

      setMarketPlaceApproved(isApprovedResponse);

      const balanceNfts = await nftContract.methods.balanceOf(metamaskAddress).call();

      setNftCount(Number(balanceNfts));

      for (let index = 0; index < balanceNfts; index++) {
        const nftId = await nftContract.methods.tokenOfOwnerByIndex(metamaskAddress, index).call();

        const nftAddress = await nftContract.methods.tokenURI(nftId).call();

        const nftMetadata: any = (await superagent.get(nftAddress)).body;
        fetchedNfts.push({
          id: nftId,
          image: nftMetadata.image,
          name: nftMetadata.name,
          description: nftMetadata.description,
          category: 'Art',
        });
      }

      setNftList(fetchedNfts);
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

  console.log(
      nftCount)

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
                  {nftCount == 0 &&
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
          <Box>
            {!marketPlaceApproved ? (
              <Box
                sx={{
                  mb: 1,
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
                    }}
                  >
                    <Typography>
                      Please enable marketplace in order to list NFTs for sale.
                    </Typography>
                    <LoadingButton
                      sx={{
                        ml: 1,
                      }}
                      disabled={(!isMetaMaskInstalled || !isWeb3Available) && !marketPlaceApproved}
                      variant="contained"
                      color="secondary"
                      onClick={enableMarketplace}
                      loading={pendingEnabling}
                    >
                      Enable eNFTiverse NFTs on marketplace
                    </LoadingButton>
                  </Box>
                </Alert>
              </Box>
            ) : (
              ''
            )}
            <ExploreNFTList
              forListing={marketPlaceApproved}
              loadingCount={4}
              isDefault={true}
              prepareListForSale={prepareListForSale}
              nfts={nftList}
            />
          </Box>
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
