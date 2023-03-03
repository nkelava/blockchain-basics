// function deploy(hre) {
//   console.log("Hi");
// }

// module.exports.default = deploy;
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
};
