const { log } = require('console');
const express = require('express');
const nearAPI = require('near-api-js');
const app = express();
const path = require("path");
const homedir = require("os").homedir();

let k ;
const HELP = `Please run this script in the following format:
    node create-testnet-account.js CREATOR_ACCOUNT.testnet NEW_ACCOUNT.testnet AMOUNT
`;
app.get('/', (req, res) => {
    
  res.send(main());
});

app.post('/', (req, res) => {
  res.send(check(k));
})

app.listen(3000, () => {
  console.log('App listening on port 3000');
});



async function main(){

const { connect, KeyPair, keyStores, utils } = nearAPI;
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

if (process.argv.length !== 5) {
  console.info(HELP);
  process.exit(1);
}

createAccount(process.argv[2], process.argv[3], process.argv[4]);

async function createAccount(creatorAccountId, newAccountId, amount) {
  const near = await connect({ ...config, keyStore });
  const creatorAccount = await near.account(creatorAccountId);
  const keyPair = KeyPair.fromRandom("ed25519");
  const publicKey = keyPair.publicKey.toString();
  await keyStore.setKey(config.networkId, newAccountId, keyPair);

  k = keyPair.secretKey;

  const result = await creatorAccount.functionCall({
    contractId: "testnet",
    methodName: "create_account",
    args: {
      new_account_id: newAccountId,
      new_public_key: publicKey,
    },
    gas: "300000000000000",
    attachedDeposit: utils.format.parseNearAmount(amount),
  });
  console.log(`Account ${newAccountId} created with transaction hash: ${result.transaction.hash}`);
  // console.log(result.receipts_outcome);
  console.log(result.status);
  console.log(result.transaction_outcome);
  console.log(keyPair.secretKey);
  return result;
  }

  return k;
}

async function check(pKey){

const privateKey = pKey;
const keyPair = nearAPI.utils.KeyPair.fromString(privateKey);
const accountId = "your_account_id";

const config = {
  keyStore: new nearAPI.keyStores.InMemoryKeyStore(),
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
};

const near = await nearAPI.connect(config);
const account = await near.account(accountId, keyPair);

console.log(account.accountId);
return account.getAccountDetails(accountId);
}