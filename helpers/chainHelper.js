/**
 * High level helper file that facilitates interacting with the blockchain
 * Define 1 to 1 code coverage of smart contract functions here
 * Can also refer to helpers/blockchain/baseChainFunctions.js for call and sendTx functions that enable easy calling of any smart contract function not explicitly covered here
 *
 * @package: Life
 * @author:  Chris Verceles <chris@lifeme.sh>
 * @since:   2018-01-03

 */

const chainFunctions = require("./baseBlockchainFuncs");

module.exports = {
  /**
   * Initialises Ethereum blockchain connection via ethers.js
   * @param {Object} secrets environment variable, containing connection strings and/or other sensitive data that should not end up on github) whether through a secrets object or .env file
   * @returns {Promise} Promise if successful, throws an error if walletParam did not have read and write access or an instantiated walletParam.provider field
   */
  initConnection: async (secrets, contractName) => {
    let contract = await chainFunctions.init(secrets, contractName);
    let connected = chainFunctions.isConnected() && contract !== 'undefined';
    if (connected) {
      return getInstance.apply(module.exports);
    } else {
      throw new Error("SEED: CHAIN CONFIGURE FATAL ERROR");
    }

    function getInstance () {
      return this;
    }
  },

  // call smart contract functions here using baseBlockchainFuncs.js low level helper funcs (call, sendTx)
};
