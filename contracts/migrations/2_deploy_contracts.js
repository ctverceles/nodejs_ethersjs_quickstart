var ERC20Sample = artifacts.require("./ERC20Sample.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(ERC20Sample)
};
