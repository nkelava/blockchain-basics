const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle,
        raffleContract,
        vrfCoordinatorV2Mock,
        raffleEntranceFee,
        interval,
        player;
      const chainId = network.config.chainId;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        player = accounts[1];

        await deployments.fixture(["mocks", "raffle"]);

        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        raffleContract = await ethers.getContract("Raffle");
        raffle = raffleContract.connect(player);
        raffleEntranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
      });

      describe("Constructor", function () {
        it("initializes the raffle correctly", async function () {
          const raffleState = await raffle.getRaffleState();

          assert.equal(raffleState.toString(), "0");
          assert.equal(interval.toString(), networkConfig[chainId].interval);
        });
      });

      describe("EnterRaffle", function () {
        it("reverts if minimum entrance fee requirement not met", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughETHEntered"
          );
        });

        it("does not allow entering while raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWith("Raffle__NotOpen");
        });

        it("records player on entering", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const playerContract = await raffle.getPlayer(0);

          assert.equal(player.address, playerContract);
        });

        it("emits event on entering", async function () {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.emit(raffle, "RaffleEnter");
        });
      });

      describe("CheckUpkeep", function () {
        it("returns false if player pool is empty", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          assert(!upkeepNeeded);
        });

        it("returns false if raffle is closed", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);

          const raffleState = await raffle.getRaffleState();
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          assert.equal(raffleState.toString(), "1");
          assert.equal(upkeepNeeded, false);
        });

        it("returns false if not enough time has passed", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 5,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded, false);
        });

        it("returns true if enough time has passed, has players, eth and is open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);

          assert.equal(upkeepNeeded, true);
        });
      });

      describe("PerformUpkeep", function () {
        it("runs only if checkUpkeep is true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const tx = await raffle.performUpkeep([]);

          assert(tx);
        });

        it("reverts when checkUpkeep is false", async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          );
        });

        it("updates the raffle state", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });

          const txResponse = await raffle.performUpkeep([]);
          const txReceipt = await txResponse.wait(1);
          const raffleState = await raffle.getRaffleState();
          const requestId = txReceipt.events[1].args.requestId;

          assert.isAbove(requestId.toNumber(), 0);
          assert.equal(raffleState.toString(), "1");
        });
      });

      describe("FulfillRandomWords", function () {
        beforeEach(async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: "evm_mine", params: [] });
        });

        it("gets called after performUpkeep", async function () {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request");
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
          ).to.be.revertedWith("nonexistent request");
        });

        it("picks a winner, resets, and sends money", async () => {
          const additionalEntrances = 3;
          const start = 2;

          for (let i = start; i < start + additionalEntrances; i++) {
            raffle = raffleContract.connect(accounts[i]);
            await raffle.enterRaffle({ value: raffleEntranceFee });
          }

          const startingTimestamp = await raffle.getLastTimestamp();

          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async function () {
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerBalance = await accounts[2].getBalance();
                const endingTimestamp = await raffle.getLastTimestamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[2].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerBalance.toString(),
                  startingBalance // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                    .add(
                      raffleEntranceFee
                        .mul(additionalEntrances)
                        .add(raffleEntranceFee)
                    )
                    .toString()
                );
                assert.isAbove(endingTimestamp, startingTimestamp);
                resolve();
              } catch (error) {
                reject(error);
              }
            });

            const tx = await raffle.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            const startingBalance = await accounts[2].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });
    });
