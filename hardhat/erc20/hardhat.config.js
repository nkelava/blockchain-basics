require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "0xKey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0xKey";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "0xKey";
const REPORT_GAS = process.env.REPORT_GAS || false;

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  networks: {
    hardhat: {
      name: "hardhat",
      chainId: 31337,
      blockConfirmations: 6,
    },
    localhost: {
      name: "localhost",
      chainId: 31337,
    },
    goerli: {
      name: "goerli",
      chainId: 5,
      url: GOERLI_RPC_URL,
      accounts: GOERLI_PRIVATE_KEY !== undefined ? [GOERLI_PRIVATE_KEY] : [],
      blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  contractSizer: {
    runOnCompile: false,
    only: ["Raffle"],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 200000,
  },
};
