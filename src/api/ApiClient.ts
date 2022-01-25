import axios from 'axios';
import { API_URL } from './config';

export async function generateIPFSMetadataHash(values: any) {
  const body = new FormData();

  body.append('author', values.author);
  body.append('description', values.nftDescription);
  body.append('name', values.nftName);
  body.append('tags', values.tags.join(','));
  body.append('image', values.image);

  await axios.get(`http://94.237.84.199/product?page=0&limit=3&type=beer`, {headers: {
    'Authorization': "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2MTY5NGMzYS0yNjc2LTQzOGQtYjcyYi02NzU0ZTI4OWJjZDUiLCJleHAiOjE2NzQ1NTA3MjksImlhdCI6MTY0MzAxNDcyOX0.k-VrJLdI-rs6uI4D0Tzqs-R04WFkIQfbhoMI_Jb3Vu_ByaDM-u8NQl6DtWdxa3NssSyQAzRlFTClbYhut_6Ijg"
    }})


  const response = await axios.post(`${API_URL}/nfts/generateNFTMetadataHash`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response;
}
