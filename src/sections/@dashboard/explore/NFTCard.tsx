import React from 'react';
import { Nft } from '../../../@types/nft';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import Image from '../../../components/Image';

type Props = {
  nft: Nft;
  forListing?: boolean;
  prepareListForSale?: Function;
};

export default function NFTCard({ nft, forListing, prepareListForSale }: Props) {
  const { name, image, description } = nft;

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
        <Typography variant="subtitle1" noWrap>
          {name}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">{description}</Typography>
        </Stack>
      </Stack>
      {forListing ? (
        <Stack spacing={2} sx={{ p: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (prepareListForSale) {
                prepareListForSale(nft);
              }
            }}
          >
            List for Sale
          </Button>
        </Stack>
      ) : (
        ''
      )}
    </Card>
  );
}
