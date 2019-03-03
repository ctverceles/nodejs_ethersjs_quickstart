/**
 * File to be the single source of truth for any blockchain connection reference
 * Built for serverless Firebase 
 *
 * @package: Life
 * @author:  Chris Verceles <chris@lifeme.sh>
 * @since:   2018-01-03
 * @flow
 */

const chainHelper = require("./chainHelper");

let chainConn = false;

module.exports = {
  getChainConnection: async (secrets, contractName) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(isChainConnValid(chainConn))) {
          chainConn = await chainHelper.initConnection(secrets, contractName);
          resolve(chainConn);
        } else {
          resolve(chainConn);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
};

function isChainConnValid (chainConn) {
  try {
    return chainConn !== 'undefined' && chainConn !== false && chainConn.isConnected();
  } catch (err) {
    return false;
  }
}
