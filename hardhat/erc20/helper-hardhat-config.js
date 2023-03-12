const { ethers } = require("hardhat");

const networkConfig = {
  31337: {
    name: "localhost",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xd4a33860578de61dbabdc8bfdb98fd742fa7028e",
  },
};

const developmentChains = ["hardhat", "localhost"];
const INITIAL_SUPPLY = "1000000000000000000000000";

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
};
