require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const MORALIS_NODE_URL = process.env.MORALIS_NODE_URL;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: MORALIS_NODE_URL,
      accounts: [RINKEBY_PRIVATE_KEY],
    },
  },
};