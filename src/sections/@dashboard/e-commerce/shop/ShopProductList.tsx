import { Box } from '@mui/material';
import { Product } from '../../../../@types/product';
import ShopProductCard from './ShopProductCard';
import SkeletonProductItem from "../../../../components/skeleton/SkeletonProductItem";

// ----------------------------------------------------------------------

type Props = {
  products: Product[];
  isDefault: boolean;
  loadingCount?: number
};

export default function ShopProductList({ products, isDefault, loadingCount }: Props) {
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
      {(loading ? [...Array(loadingCount ? loadingCount : 12)] : products).map((product, index) =>
        product ? (
          <ShopProductCard key={product.id} product={product} />
        ) : (
          <SkeletonProductItem key={index} />
        )
      )}
    </Box>
  );
}
