// @mui
import { Box } from '@mui/material';
// @type
import { Product } from '../../../../@types/product';
// components
//
import ShopProductCard from './ShopProductCard';
import SkeletonProductItem from "../../../../components/skeleton/SkeletonProductItem";

// ----------------------------------------------------------------------

type Props = {
  products: Product[];
  isDefault: boolean;
};

export default function ShopProductList({ products, isDefault }: Props) {
  const loading = !products.length && isDefault;

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
      {(loading ? [...Array(12)] : products).map((product, index) =>
        product ? (
          <ShopProductCard key={product.id} product={product} />
        ) : (
          <SkeletonProductItem key={index} />
        )
      )}
    </Box>
  );
}
