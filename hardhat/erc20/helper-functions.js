const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    const errorMsg = error.message.toLowerCase().includes("already verified")
      ? "Already verified!"
      : error;
    console.log(errorMsg);
  }
};

module.exports = {
  verify,
};
