export type ProductStatus = 'sale' | 'new' | '';

export type ProductCategory = 'Art';

export type Product = {
  nftId: string;
  contractAddress: string;
  image: string;
  name: string;
  price: number;
  priceSale: number | null;
  status: ProductStatus;
  description: string;
  category: ProductCategory;
};