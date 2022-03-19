import {NftCollection} from "../@types/nft";

export const API_URL = process.env.REACT_APP_API_URL;

export const EXPLORER_URL = process.env.REACT_APP_EXPLORER_URL;

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const COLLECTIONS : NftCollection[] = [
  {
    name: 'Puss Coins',
    address: process.env.REACT_APP_PUSS_CONTRACT_ADDRESS,
  },
  {
    name: 'Public',
    address: process.env.REACT_APP_CONTRACT_ADDRESS,
  },
];

export const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_ADDRESS;

export const WEB3_PROVIDER = process.env.REACT_APP_WEB3_PROVIDER;
