import axios from 'axios';
import { API_URL } from './config';

export async function generateIPFSMetadataHash(values: any) {
  const body = new FormData();

  body.append('author', values.author);
  body.append('description', values.nftDescription);
  body.append('name', values.nftName);
  body.append('tags', values.tags.join(','));
  body.append('image', values.image);

  const response = await axios.post(`${API_URL}/nfts/generateNFTMetadataHash`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response;
}
