## NodeJS EthersJS Kaleido Quickstart

#### High Level Tech Overview

1. Local dev PoA chain: https://github.com/f-o-a-m/cliquebait (configured for quicker dApp dev't)
2. Ethers.JS connection to Kaliedo private chain
3. Smart Contract Deployed on local/Kaleido chain

### Prerequisites
1. Setup .env files
- from project root, add the ff in a new .env file:

		
		CHAIN_URL="http://localhost:8545/" 
		SEED_PHRASE="candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"
		CHAIN_ID="unspecified"

### Init repository
1. Install docker if you haven't https://docs.docker.com/docker-for-mac/install/
2. Install yarn if you don't have it yet
3. Install dependencies by
	1. running `yarn install:all` at root (this installs root dependencies and /contract dependencies)
4. at root, `yarn dev:chain` to start up the local PoA chain for testing
5. at root, `yarn dev:redeploy` to deploy the smart contract on the PoA chain
6. in new window, `yarn test:chain` at root to check if everything's working (currently only tests ethersjs blockchain connection)

#### Note
The above instructions are for running on a local chain (dev environment). instructions for deploying to kaleido chain:
1. Comment out DEV flags in project root .env file
2. uncomment QA flags in project root .env file
** kaleido URL is currently set to my account. you'll want to login to kaleido.io and make your own account then get the credentials and RPC URL from it. 

### Recommended Config
1. Node version 8.10.0
2. npm version 6.4.1
3. (if it matters) python 3.6.0