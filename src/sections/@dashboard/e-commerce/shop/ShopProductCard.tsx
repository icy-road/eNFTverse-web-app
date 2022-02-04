import { paramCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { Product } from '../../../../@types/product';
import Image from '../../../../components/Image';
import React from 'react';

type Props = {
  product: Product;
};

export default function ShopProductCard({ product }: Props) {
  const { nftId, name, description, image, price, contractAddress } = product;

  const linkTo = `/marketplace/nft/${paramCase(nftId)}/${contractAddress}`;

  return (
    <Card
      sx={{
        boxShadow: '10',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Image alt={name} src={image} ratio="1/1" />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link to={linkTo} color="inherit" component={RouterLink}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Link>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">{description}</Typography>
        </Stack>

        <Link to={linkTo} color="inherit" component={RouterLink}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" color="secondary">
              &nbsp;{price + ' CRO'}
            </Typography>
          </Stack>
        </Link>
      </Stack>
    </Card>
  );
}
