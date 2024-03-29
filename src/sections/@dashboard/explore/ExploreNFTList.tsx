import { Nft } from '../../../@types/nft';
import { Box } from '@mui/material';
import SkeletonProductItem from '../../../components/skeleton/SkeletonProductItem';
import { NFTCard } from './index';
import React from 'react';

type Props = {
  nfts: Nft[];
  isDefault: boolean;
  loadingCount?: number;
  forListing?: boolean;
  prepareListForSale?: Function;
};

export default function ExploreNFTList({
  nfts,
  isDefault,
  loadingCount,
  forListing,
  prepareListForSale,
}: Props) {
  const loading = !nfts || !nfts.length && isDefault;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
      }}
    >
      {(loading ? [...Array(loadingCount ? loadingCount : 12)] : nfts).map((nft, index) =>
        nft ? (
          <NFTCard prepareListForSale={prepareListForSale} forListing={forListing} nft={nft} />
        ) : (
          <SkeletonProductItem key={index} />
        )
      )}
    </Box>
  );
}
