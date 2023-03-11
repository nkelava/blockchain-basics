const { ethers, network } = require("hardhat");
const fs = require("fs");

const CLIENT_ADDRESSES_FILE = "../client/src/constants/contract-addresses.json";
const CLIENT_ABI_FILE = "../client/src/constants/abi.json";

module.exports = async function () {
  if (process.env.UPDATE_CLIENT) {
    updateContractAddresses();
    updateAbi();
  }
};

async function updateContractAddresses() {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(CLIENT_ADDRESSES_FILE, "utf-8")
  );

  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffle.address)) {
      currentAddresses[chainId].push(raffle.address);
    }
  } else {
    currentAddresses[chainId] = [raffle.address];
  }

  fs.writeFileSync(CLIENT_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");

  fs.writeFileSync(
    CLIENT_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

module.exports.tag = ["all", "client"];
