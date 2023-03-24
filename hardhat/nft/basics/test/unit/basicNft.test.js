const { assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Basic NFT Unit Test", () => {
      let basicNft, deployer;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNft");
      });

      describe("Contructor", () => {
        it("initializes the NFT correctly", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          const tokenCounter = await basicNft.getTokenCounter();

          assert.equal(name, "Doggie");
          assert.equal(symbol, "DOG");
          assert.equal(tokenCounter.toString(), "0");
        });
      });

      describe("Mint NFT", () => {
        beforeEach(async () => {
          const txResponse = await basicNft.mintNft();
          await txResponse.wait(1);
        });

        it("allow users to mint an NFT", async () => {
          const tokenURI = await basicNft.tokenURI(0);
          const tokenCounter = await basicNft.getTokenCounter();

          assert.equal(tokenCounter.toString(), "1");
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });

        it("show the correct balance", async () => {
          const deployerBalance = await basicNft.balanceOf(deployer.address);

          assert.equal(deployerBalance.toString(), "1");
        });

        it("show the owner of an NFT", async () => {
          const owner = await basicNft.ownerOf("0");

          assert.equal(owner, deployer.address);
        });
      });
    });
