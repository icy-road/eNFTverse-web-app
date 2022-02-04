import { useFormik, Form, FormikProvider, useField } from 'formik';
import { styled } from '@mui/material/styles';
import { Box, Grid, Button, Divider, IconButton, Typography, Card, Tab, Link } from '@mui/material';
import { Product } from '../../../../@types/product';
import Iconify from '../../../../components/Iconify';
import React from 'react';
import Markdown from '../../../../components/Markdown';
import { TabContext, TabList, TabPanel } from '@mui/lab';

const RootStyle = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up(1368)]: {
    padding: theme.spacing(3, 6),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  product: Product;
};

export default function ProductDetailsSummary({ product, ...other }: Props) {
  const { nftId, name, price, status, priceSale } = product;

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

  const handleAddCart = async () => {
    try {
    } catch (error) {
      console.error(error);
    }
  };

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
              color: status === 'sale' ? 'error.main' : 'info.main',
            }}
          >
            {status}
          </Typography>

          <Typography variant="h5" paragraph>
            {name}
          </Typography>

          <Typography variant="h4" sx={{ mb: 3 }}>
            &nbsp;{price + ' CRO'}
          </Typography>

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
                      <Typography paragraph>NFT Address</Typography>
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

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Box sx={{ mt: 5 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Button fullWidth size="large" type="submit" color="info" variant="contained">
                  Buy Now
                </Button>
              </Grid>
            </Grid>
          </Box>
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
