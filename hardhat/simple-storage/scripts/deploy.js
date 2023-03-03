const { ethers, run, network } = require("hardhat");

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");

  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();

  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }
}

async function verify(contractAddress, args) {
  try {
    console.log("Verifying contract...");

    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    const message = error.message.toLowercase().includes("already verified")
      ? "Already verified."
      : error;
    console.log(message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
