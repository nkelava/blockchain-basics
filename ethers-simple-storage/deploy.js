const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
  const bin = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf-8");

  const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
  console.log("Deploying, please wait...");

  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);

  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Current favorite number: ${currentFavoriteNumber.toString()}`);

  const transactionResponse = await contract.store("7");
  await transactionResponse.wait(1);

  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Updated favorite number: ${updatedFavoriteNumber.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
