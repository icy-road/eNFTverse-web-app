import { Nft } from '../../../@types/nft';
import { Box } from '@mui/material';
import SkeletonProductItem from '../../../components/skeleton/SkeletonProductItem';
import { NFTCard } from './index';

type Props = {
  nfts: Nft[];
  isDefault: boolean;
};

export default function ExploreNFTList({ nfts, isDefault }: Props) {
  const loading = !nfts.length && isDefault;

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
      {(loading ? [...Array(12)] : nfts).map((nft, index) =>
        nft ? <NFTCard nft={nft} /> : <SkeletonProductItem key={index} />
      )}
    </Box>
  );
}
