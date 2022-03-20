import { useFormik, Form, FormikProvider, useField } from 'formik';
import { styled } from '@mui/material/styles';
import { Box, Grid, Button, Divider, IconButton, Typography, Card, Tab, Link } from '@mui/material';
import { Product } from '../../../../@types/product';
import Iconify from '../../../../components/Iconify';
import React, { useEffect, useState } from 'react';
import Markdown from '../../../../components/Markdown';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import { useWeb3React } from '@web3-react/core';
import useMetaMaskOnboarding from '../../../../hooks/useMetaMaskOnboarding';
import Web3 from 'web3';
import { EXPLORER_URL, MARKETPLACE_ADDRESS, WEB3_PROVIDER } from '../../../../api/config';
import useENSName from '../../../../hooks/useENSName';
import { useNavigate } from 'react-router-dom';

const RootStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up(1368)]: {
    padding: theme.spacing(3, 6),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  product: Product;
  contractAddress?: string;
};

const nftContractABI = require('../../../../utils/NFTContract.json');
const marketplaceABI = require('../../../../utils/marketplaceAbi.json');

const superagent = require('superagent');

export default function ProductDetailsSummary({ product, contractAddress, ...other }: Props) {
  const navigate = useNavigate();
  const { nftId, name, price, status } = product;

  const { account, library } = useWeb3React();

  const { isMetaMaskInstalled, isWeb3Available } = useMetaMaskOnboarding();
  const [marketPlaceApproved, setMarketPlaceApproved] = useState(false);
  const [pendingEnabling, setPendingEnabling] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const marketplaceAddress = MARKETPLACE_ADDRESS;

  const web3 = new Web3(WEB3_PROVIDER ?? '');
  const nftContract = new web3.eth.Contract(nftContractABI, contractAddress);
  const marketPlaceContract = new web3.eth.Contract(marketplaceABI, marketplaceAddress);

  const ENSName = useENSName(account);

  useEffect(() => {
    async function checkIfMarketplaceEnabled() {
      if (account) {
        const metamaskAddress = ENSName || account ? account : null;

        setPendingEnabling(true);

        const isApprovedResponse = await nftContract.methods
          .isApprovedForAll(metamaskAddress, marketplaceAddress)
          .call();

        setPendingEnabling(false);

        setMarketPlaceApproved(isApprovedResponse);
      }
    }

    checkIfMarketplaceEnabled();
  }, [account]);

  const buyNft = async () => {
    setIsBuying(true);

    const buyNftAbi = await marketPlaceContract.methods
      .buyNFTById(contractAddress, nftId)
      .encodeABI();

    const metamaskAddress = ENSName || account ? account : null;

    const params = {
      from: metamaskAddress,
      to: marketplaceAddress,
      data: buyNftAbi,
      value: price,
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
        navigate('/owned');
        window.open(`${EXPLORER_URL}/tx/${txHash}/`);

        setIsBuying(false);
        setMarketPlaceApproved(true);
      })
      .catch((err: any) => {
        console.log(err);
        setIsBuying(false);
      });
  };

  const enableNFTs = async () => {
    setPendingEnabling(true);

    const approveForAllAbi = await nftContract.methods
      .setApprovalForAll(marketplaceAddress, true)
      .encodeABI();

    const metamaskAddress = ENSName || account ? account : null;

    const params = {
      from: metamaskAddress,
      to: contractAddress,
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

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nftId,
      name,
      price,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(false);
      } catch (error) {
        setSubmitting(false);
      }
    },
  });

  const { handleSubmit } = formik;

  return (
    <RootStyle {...other}>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Typography
            variant="overline"
            sx={{
              mt: 2,
              mb: 1,
              display: 'block',
              color: status === 'sold' ? 'error.main' : 'info.main',
            }}
          >
            {status}
          </Typography>

          <Typography variant="h5" paragraph>
            {name}
          </Typography>

          {status !== 'sold' ? (
            <Typography variant="h4" sx={{ mb: 3 }}>
              &nbsp;{web3.utils.fromWei(price.toString(), 'ether') + ' CRO'}
            </Typography>
          ) : (
            ''
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Markdown children={product.description} />
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

          <Card>
            <TabContext value={'1'}>
              <Box sx={{ px: 3, bgcolor: 'background.neutral' }}>
                <TabList>
                  <Tab disableRipple value="1" label="Info" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <Box sx={{ p: 3, pb: 1 }}>
                  <Grid container spacing={2} justifyContent={'space-between'}>
                    <Grid item xs={8}>
                      <Typography paragraph>Contract Address</Typography>
                    </Grid>
                    <Grid item xs={4} display={'flex'} justifyContent={'flex-end'}>
                      <Link
                        href={`https://cronos.crypto.org/explorer/testnet3/tokens/${product.contractAddress}/token-transfers`}
                        noWrap
                        target="_blank"
                        align="right"
                      >
                        {product.contractAddress}
                      </Link>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} justifyContent={'space-between'}>
                    <Grid item xs={8}>
                      <Typography paragraph>NFT ID</Typography>
                    </Grid>
                    <Grid item xs={4} display={'flex'} justifyContent={'flex-end'}>
                      <Link
                        href={`https://cronos.crypto.org/explorer/testnet3/tokens/${product.contractAddress}/instance/${product.nftId}/token-transfers`}
                        noWrap
                        target="_blank"
                        align="right"
                      >
                        {product.nftId}
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </TabContext>
          </Card>

          {status !== 'sold' ? (
            !isMetaMaskInstalled ||
            !isWeb3Available ||
            typeof account !== 'string' ||
            !marketPlaceApproved ? (
              <Box sx={{ mt: 5 }}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      disabled={
                        (!isMetaMaskInstalled || !isWeb3Available || typeof account !== 'string') &&
                        !marketPlaceApproved
                      }
                      variant="contained"
                      color="secondary"
                      onClick={enableNFTs}
                      loading={pendingEnabling}
                    >
                      {typeof account !== 'string'
                        ? 'Connect Metamask'
                        : 'Enable eNFTiverse NFTs on marketplace'}
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ mt: 5 }}>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      color="info"
                      variant="contained"
                      onClick={buyNft}
                      loading={isBuying}
                    >
                      Buy Now
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            )
          ) : (
            ''
          )}
        </Form>
      </FormikProvider>
    </RootStyle>
  );
}

// ----------------------------------------------------------------------

type IncrementerProps = {
  name: string;
  available: number;
};

function Incrementer({ name, available }: IncrementerProps) {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;

  const incrementQuantity = () => {
    setValue(value + 1);
  };
  const decrementQuantity = () => {
    setValue(value - 1);
  };

  return (
    <Box
      sx={{
        py: 0.5,
        px: 0.75,
        border: 1,
        lineHeight: 0,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        borderColor: 'grey.50032',
      }}
    >
      <IconButton size="small" color="inherit" disabled={value <= 1} onClick={decrementQuantity}>
        <Iconify icon={'eva:minus-fill'} width={16} height={16} />
      </IconButton>
      <Typography
        variant="body2"
        component="span"
        sx={{
          width: 40,
          textAlign: 'center',
          display: 'inline-block',
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        color="inherit"
        disabled={value >= available}
        onClick={incrementQuantity}
      >
        <Iconify icon={'eva:plus-fill'} width={16} height={16} />
      </IconButton>
    </Box>
  );
}
