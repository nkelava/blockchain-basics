const { network, ethers } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");

const VRF_SUBSCRIPTION_FUND_AMOUNT = ethers.utils.parseEther("1");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const isDevelopmentNetwork = developmentChains.includes(network.name);
  let vrfCoordinatorV2Address, subscriptionId;

  if (isDevelopmentNetwork) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);

    subscriptionId = transactionReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUBSCRIPTION_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  const entranceFee = networkConfig[chainId].entranceFee;
  const gasLane = networkConfig[chainId].gasLane;
  const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
  const interval = networkConfig[chainId].interval;
  const waitConfirmations = isDevelopmentNetwork
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: [
      vrfCoordinatorV2Address,
      subscriptionId,
      entranceFee,
      gasLane,
      callbackGasLimit,
      interval,
    ],
    log: true,
    waitConfirmations: waitConfirmations,
  });

  if (isDevelopmentNetwork) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
  }

  if (!isDevelopmentNetwork && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(raffle.address, args);
  }

  log("--------------------------------------------------------------------");
};

module.exports.tags = ["all", "raffle"];