/**
 * Low level ethereum blockchain interactions
 * Use call and sendTx methods to call any smart contract func
 *
 * @package: Life
 * @author:  Chris Verceles <chris@lifeme.sh>
 * @since:   2018-01-03
 * @flow
 */

const {readFileSync} = require('fs');
const {Contract, Wallet, providers} = require('ethers');
const moveDecimal = require('move-decimal-point');
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const url = require('url')

let staticConnVars = (function () {
  let wallet;
  let contract;
  let hdWalletProvider; // This is the private persistent value
  // The outer function returns a nested function that has access
  // to the persistent value.  It is this nested function we're storing
  // in the variable staticConnVars above.
  return function () { return {wallet, contract, hdWalletProvider}; };
})();
let connVars = staticConnVars();

module.exports = {
  /**
   * Initialises lower level functions to be used in /helpers/chainHelper.js
   * @param {object} secrets object containing decrypted secrets data from AWS
   * @returns {Promise} the contract object that abstracts the smart contract
   */
  init: async (secrets, contractName) => {
    if (!secrets || !secrets.SEED_PHRASE || !secrets.CHAIN_URL) {
      return Promise.reject(new Error("baseChainFunctions.js: Missing or invalid secrets or secrets field(s)"));
    }

    connVars.wallet = Wallet.fromMnemonic(secrets.SEED_PHRASE);

    /**
     * If we have the auth information then use that to connect, rather than just the URL
     * See : https://docs.ethers.io/ethers.js/html/api-providers.html#jsonrpcprovider-inherits-from-provider
     *
    */
    let connectionData;
    const connectionUrl = url.parse(secrets.CHAIN_URL);
    if (connectionUrl.auth) {
        connectionData = {
            url: connectionUrl.protocol+'//'+connectionUrl.host,
            user: connectionUrl.auth.split(':')[0],
            password: connectionUrl.auth.split(':')[1],
            allowInsecure: false
        };
    } else {
        connectionData = secrets.CHAIN_URL;
    }
    /**
     * when using JsonRpcProvider and when connecting to a local geth node,
     * pass 'unspecified' as a chain id parameter (2nd parameter) to avoid
     * 'invalid sender' error when calling ethers.Wallet.sendTransaction method.
     * If secrets.CHAIN_ID === 'unspecified' then means we're in dev
     * otherwise (for Kaleido) we must pass an object with the `chainId` property
    */
    let provider;
    if (secrets.CHAIN_ID === 'unspecified') {
      provider = new providers.JsonRpcProvider(connectionData, 'unspecified');
    } else {
      provider = new providers.JsonRpcProvider(connectionData, { chainId: secrets.CHAIN_ID });
    }

    connVars.wallet = new Wallet(connVars.wallet.privateKey, provider);

    // for getting other wallet addresses (SOOW address is hdWalletProvider.getAddresses()[1])
    connVars.hdWalletProvider = new HDWalletProvider(secrets.SEED_PHRASE, secrets.CHAIN_URL, 0, 10);

    // using web3 getId func to fetch the network we're on - ethers doesn't have an easy to access equivalent
    let web3 = new Web3(secrets.CHAIN_URL);
    let network = await web3.eth.net.getId();

    let buildDir = process.cwd() + "/chainResources/";
    let json = loadContractJSONFile(buildDir, contractName);
    let address = json.networks[network].address;

    // pass a wallet containing a provider for read + write access to the smart contract
    connVars.contract = new Contract(address, json.abi, connVars.wallet);
    checkIfContractExistsThrowOtherwise();

    return Promise.resolve(connVars.contract);
  },

  /**
   * Checks whether or not a blockchain connection has been initialised
   * @returns boolean
   */
  isConnected: () => {
    return connVars.wallet !== 'undefined' && connVars.wallet.provider !== 'undefined' && connVars.contract !== 'undefined' && connVars.hdWalletProvider !== 'undefined';
  },

  /**
   * Calls a read only function from the connected node
   * @param {string} funcName The name of the read only smart contract function to be triggered
   * @param {any[]} callParams Parameters that are to be passed to the read only smart contract function in the same order
   * @returns {Promise} a Promise for the value to be returned from the read only smart contract function
   */
  call: async (funcName, ...callParams) => {
    checkIfContractExistsThrowOtherwise();
    checkIfStringExistsIsNotEmptyThrowOtherwise(funcName, "baseChainFunctions.js: call method");

    try {
      let result = await connVars.contract[funcName](...callParams);

      return result;
    } catch (err) {
      throw new Error("Failed to execute call (read only transaction): " + err); // need better logging
    }
  },

  /**
   * Broadcasts a state changing (write) transaction to the blockchain
   * @param {string} funcName The name of the smart contract function to be triggered
   * @param {any[]} callPa Parameters that are to be passed to the smart contract function in the same order
   * @returns {Promise} a Promise for the transaction receipt object containing details of the successful tx and throws an error if the transaction failed to confirm
   */
  sendTx: async (funcName, ...callParams) => {
    checkIfContractExistsThrowOtherwise();
    checkIfStringExistsIsNotEmptyThrowOtherwise(funcName, "baseChainFunctions.js: sendTx method");

    try {
      const tx = await connVars.contract.functions[funcName](...callParams);
      await tx.wait(); // wait for tx to be confirmed. can optionally enter integer parameter denoting # of blocks to wait, ex: await tx.wait(3)
      // now get txReceipt using Provider that should be in Wallet
      const txReceipt = await connVars.wallet.provider.getTransactionReceipt(tx.hash);

      // check status of tx, 0 = failed, 1 = success
      if (txReceipt.status === 0) {
        const error = new Error(`Failed transaction ${tx.Hash} with status code ${txReceipt.status}. ${txReceipt.gasUsed} gas used`);
        throw error;
      }

      return txReceipt;
    } catch (err) {
      throw new Error("Failed to execute sendTx (state changing transaction): " + err); // need better logging
    }
  },
  /**
  * Moves the decimal point in a number to the left by the number of decimal places
  * @param {number | BN} amount The integer value to shift to the left
  * @returns {string}
  */
  integerToDecimal: async (amount, decimalMultiplier) => {
    return parseFloat(moveDecimal(amount.toString(), -decimalMultiplier));
  },
  /**
  * Moves the decimal point in a number to the right by the number of decimal places
  * @param {number | BN} amount The integer value to shift to the right
  * @returns {string}
  */
  decimalToInteger: async (amount, decimalMultiplier) => {
    return parseFloat(moveDecimal(amount.toString(), decimalMultiplier).split('.')[0]);
  },
  /**
   * Returns the initialised ethers.Wallet with read and write access, but throws if init method has not yet been called
   * @returns {Wallet}
   */
  getHDWalletProviderWallet: (accountNum) => {
    if (connVars.hdWalletProvider) {
      const addresses = connVars.hdWalletProvider.getAddresses();
      return addresses[accountNum];
    } else throw new Error("baseChainFunctions: hdWalletProvider has not been initialised");
  }
};

/**
 * Empty or null string checker
 * @param {string} stringName The string to check
 * @param {string} errorLocation the location where the string is passed from
 */
function checkIfStringExistsIsNotEmptyThrowOtherwise (stringName, errorLocation) {
  if (!stringName || stringName === '') {
    throw new Error(`string is empty in: ${errorLocation}`);
  }
}

/**
 * Loads the JSON file interface that refers to the deployed smart contract (SOOW.sol)
 * @param {string} contractBuildFolder The folder containing *.json
 * @param {string} contractName The name of the smart contract without any extension or file types
 * @returns the parsed json object
 */
function loadContractJSONFile (contractBuildFolder, contractName) {
  try {
    const filename = contractBuildFolder + contractName + '.json';

    const jsonStr = readFileSync(filename, 'utf8');
    const json = JSON.parse(jsonStr);

    return json;
  } catch (err) {
    throw new Error(`Failed to load contract json from file with folder ${contractBuildFolder} and contract name ${contractName}`);
  }
}

/**
 * Creates the default options for sending transactions to the blockchain
 * @param {number} gasPriceParam: set the gas price for sending transactions, leave blank as default parameter if in a 0 gas environment (eg, local env)
 * @returns an object with the gasPrice and gasLimit fields
 */
function createSendOptions (gasPriceParam = 0) {
  return {
    gasPrice: gasPriceParam,
    gasLimit: 1200000
  };
}

/**
 * Check if the contract object has been instantiated
 * @returns {boolean} A boolean flag
 */
function checkIfContractExistsThrowOtherwise () {
  if (!connVars.contract || !connVars.contract.address) {
    throw new Error(`contract address has not been set`);
  }
}
