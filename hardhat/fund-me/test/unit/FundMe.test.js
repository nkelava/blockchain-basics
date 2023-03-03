const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
  let deployer, mockV3Aggregator, fundMe;
  const sendValue = ethers.utils.parseEther("1");

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);

    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    fundMe = await ethers.getContract("FundMe", deployer);
  });

  describe("constructor", async function () {
    it("Sets the aggregator addresses correctly", async function () {
      const response = await fundMe.i_priceFeedAddress();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("Updated the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);

      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);

      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a single funder", async function () {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const totalGasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundMeBalance).toString(),
        endingDeployerBalance.add(totalGasCost).toString()
      );
    });

    it("Allows us to withdraw with multiple funders", async function () {
      const accounts = await ethers.getSigners();

      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const totalGasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundMeBalance).toString(),
        endingDeployerBalance.add(totalGasCost).toString()
      );

      await expect(fundMe.funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);

      await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
        "FundMe__NotOwner"
      );
    });
  });
});
