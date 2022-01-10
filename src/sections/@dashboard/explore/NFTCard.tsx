import { Nft } from '../../../@types/nft';
import { Box, Card, Link, Stack, Typography } from '@mui/material';
import Image from '../../../components/Image';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  nft: Nft;
};

export default function NFTCard({ nft }: Props) {
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

        <Stack  direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
