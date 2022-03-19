export type Nft = {
  id?: string;
  image: string;
  name: string;
  description: string;
  category: 'Art';
};

export type NftCollection = {
  name: string;
  address?: string;
}