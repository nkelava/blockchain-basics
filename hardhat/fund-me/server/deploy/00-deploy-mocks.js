const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  if (developmentChains.includes(network.name)) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Local network detected! Deploying mocks...");

    if (chainId === 31337) {
      await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        log: true,
        args: [DECIMALS, INITIAL_ANSWER],
      });

      log("Mocks deployed...");
      log(
        "--------------------------------------------------------------------"
      );
    }
  }
};

module.exports.tags = ["all", "mocks"];
