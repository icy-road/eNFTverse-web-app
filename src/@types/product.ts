export type ProductStatus = 'sale' | 'new' | 'sold' | '';

export type ProductCategory = 'Art';

export type Product = {
  nftId: string;
  contractAddress: string;
  author: string;
  image: string;
  name: string;
  price: number;
  priceSale: number | null;
  status: ProductStatus;
  description: string;
  category: ProductCategory;
};