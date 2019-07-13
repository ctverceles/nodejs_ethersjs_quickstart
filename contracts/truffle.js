const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

const DEV_NETWORK_PORT = 8545;
let showAddresses = true;

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: DEV_NETWORK_PORT,
      network_id: '*', // Match any network id
      provider: (() => {
        // hardcoded seed phrase for now

        const DEFAULT_ACCOUNT = 0;
        const NUM_OF_ACCOUNTS_TO_GENERATE = 10;
        const { SEED_PHRASE, CHAIN_URL } = process.env;

        const wallet = new HDWalletProvider(SEED_PHRASE, CHAIN_URL, DEFAULT_ACCOUNT, NUM_OF_ACCOUNTS_TO_GENERATE);

        // output keys, for configuring EXTERNAL_ALLOCS in cliquebait docker config
        if (showAddresses) {
          const addresses = wallet.getAddresses();
          console.info('Wallet addresses:', {
            admin: addresses[0]
          });
        }
        showAddresses = false;

        return wallet;
      }),
      gasPrice: 0
    },
    qa: {
      network_id: "*", // Match any network id
      provider: () => {
        // :TODO: :SHONK: hardcoding these values for now in .env as truffle still doesn't do async providers properly
        const DEPLOYMENT_ACCOUNT_IDX = 0;
        const { SEED_PHRASE, CHAIN_URL } = process.env;

        const wallet = new HDWalletProvider(SEED_PHRASE, CHAIN_URL, DEPLOYMENT_ACCOUNT_IDX, 10);

        // output keys, for configuring EXTERNAL_ALLOCS in cliquebait docker config
        if (showAddresses) {
          const addresses = wallet.getAddresses();
          console.info('Wallet addresses:', {
            admin: addresses[0],
            SOOW_user: addresses[1]
          });
        }
        showAddresses = false;

        return wallet;
      },
      gasPrice: 0
    }
  }
}
