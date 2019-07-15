const HDWalletProvider = require('truffle-hdwallet-provider');
const { readFileSync } = require('fs')
const path = require('path')
const { join } = require('path')
const LoomTruffleProvider  = require ('loom-truffle-provider')
const { sha256 } = require ('js-sha256')
const { CryptoUtils } = require ('loom-js')
const { mnemonicToSeedSync } = require ('bip39')
const fs = require('fs')
const PrivateKeyProvider = require("truffle-privatekey-provider");
require('dotenv').config();

const DEV_NETWORK_PORT = 8545;
let showAddresses = true;

function getLoomProviderWithPrivateKey (privateKeyPath, chainId, writeUrl, readUrl) {
  const privateKey = readFileSync(privateKeyPath, 'utf-8')
  return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
}

function getLoomProviderWithMnemonic (mnemonicPath, chainId, writeUrl, readUrl) {
  const mnemonic = readFileSync(mnemonicPath, 'utf-8').toString().trim()
  const seed = mnemonicToSeedSync(mnemonic)
  const privateKeyUint8ArrayFromSeed = CryptoUtils.generatePrivateKeyFromSeed(new Uint8Array(sha256.array(seed)))
  const privateKeyB64 = CryptoUtils.Uint8ArrayToB64(privateKeyUint8ArrayFromSeed)
  return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKeyB64)
}

module.exports = {
  contracts_build_directory: join(__dirname, './src/contracts'),
  compilers: {
    solc: {
      version: '0.4.24'
    }
  },
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
    loom_dapp_chain: {
      provider: function() {
        const chainId = 'default'
        const writeUrl = 'http://127.0.0.1:46658/rpc'
        const readUrl = 'http://127.0.0.1:46658/query'
        const mnemonicPath = path.join(__dirname, 'loom_mnemonic')
        const privateKeyPath = path.join(__dirname, 'loom_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          loomTruffleProvider.createExtraAccountsFromMnemonic(process.env.SEED_PHRASE, 10)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        }
      },
      network_id: '*'
    },
    loomv2b: {
      provider: function() {
        const chainId = 'loomv2b'
        const writeUrl = 'http://loomv2b.dappchains.com:46658/rpc'
        const readUrl = 'http://loomv2b.dappchains.com:46658/query'
        const mnemonicPath = path.join(__dirname, 'loomv2b_mnemonic')
        const privateKeyPath = path.join(__dirname, 'loomv2b_pk')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        }
      },
      network_id: '12106039541279'
    },
    extdev_plasma_us1: {
      provider: function() {
        const chainId = 'extdev-plasma-us1'
        const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc'
        const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query'
        const mnemonicPath = path.join(__dirname, 'extdev_mnemonic')
        const privateKeyPath = path.join(__dirname, 'extdev_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          // use a dummy mnemonic to create a bunch of accounts we'll use for testing purposes
          loomTruffleProvider.createExtraAccountsFromMnemonic(process.env.SEED_PHRASE, 10)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        }
      },
      network_id: '9545242630824'
    },
    loom_mainnet: {
      provider: function () {
        const chainId = 'default'
        const writeUrl = 'http://plasma.dappchains.com/rpc'
        const readUrl = 'http://plasma.dappchains.com/query'
        const mnemonicPath = path.join(__dirname, 'mainnet_mnemonic')
        const privateKeyPath = path.join(__dirname, 'mainnet_private_key')
        if (fs.existsSync(privateKeyPath)) {
          const loomTruffleProvider = getLoomProviderWithPrivateKey(privateKeyPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        } else if (fs.existsSync(mnemonicPath)) {
          const loomTruffleProvider = getLoomProviderWithMnemonic(mnemonicPath, chainId, writeUrl, readUrl)
          return loomTruffleProvider
        }
      },
      network_id: '*'
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
