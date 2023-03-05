const { network } = require("hardhat");

const BASE_FEE = "250000000000000000";
const GAS_PRICE_LINK = 1e9;

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (network.config.chainId == 31337) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Local network detected! Deploying mocks...");

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    });

    log("Mocks deployed...");
    log("--------------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
