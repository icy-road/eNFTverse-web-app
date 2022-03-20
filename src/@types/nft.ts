export type Nft = {
  id?: string;
  address?: string;
  collection: string;
  image: string;
  name: string;
  description: string;
  category: 'Art';
};

export type NftCollection = {
  name: string;
  address?: string;
}