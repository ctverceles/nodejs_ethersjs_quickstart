/**
 * Unit tests showcasing blockchain functionality
 *
 * @package: Life
 * @author:  Chris Verceles <chris@lifeme.sh>
 * @since:   2018-01-04
 * @flow
 */

const chainConnection = require("../helpers/chainConnection");

require('dotenv').config();

jest.setTimeout(30000); // timeout for each test in milliseconds

describe('chain tests', async () => {
  let chainConn = false;

  // make sure to change this if you change the contract name
  let contractName = "ERC20Sample";

  beforeAll(async (done) => {
    const secrets = process.env;
    try {
      chainConn = await chainConnection.getChainConnection(secrets, contractName);
    } catch (err) {
      console.log(`chainConn err: `, err);
    }

    done();
  });

  it('chainConnection should not be false', async (done) => {
    expect(chainConn).not.toBeFalsy();
    done();
  });

});
