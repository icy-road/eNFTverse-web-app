export type ProductStatus = 'sale' | 'new' | '';

export type ProductCategory = 'Art';

export type Product = {
  id: string;
  image: string;
  name: string;
  price: number;
  priceSale: number | null;
  status: ProductStatus;
  description: string;
  createdAt: Date | string | number;
  category: ProductCategory;
};