const nftContractABI = require('./NFTContract.json');
const fs = require('fs');
const Web3 = require('web3');
const superagent = require('superagent');

const web3 = new Web3('https://cronos-testnet-3.crypto.org:8545');

const nftContract = new web3.eth.Contract(nftContractABI, '0x94667a5A3042f3369033F9476bFf9A0E51f361d7');

async function run(){

    const totalSupply = await nftContract.methods.totalSupply().call();
    console.log(totalSupply)
    for(let i=0; i<totalSupply; i++){
        const tokenMetadataUri = await nftContract.methods.tokenURI(i).call();
        console.log(tokenMetadataUri)
        console.log((await superagent.get(tokenMetadataUri)).body); //metadata json
    }

}
run()
