const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let deployer, fundMe;
      const sendValue = ethers.utils.parseEther("0.2");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows people to fund and withdraw", async function () {
        const fundTxResponse = await fundMe.fund({ value: sendValue });
        await fundTxResponse.wait(1);
        const withdrawTxResponse = await fundMe.withdraw();
        await withdrawTxResponse.wait(1);

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );

        assert.equal(endingFundMeBalance.toString(), "0");
      });
    });
