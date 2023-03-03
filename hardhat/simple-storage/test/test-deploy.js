const { ethers } = require("hardhat");
const { assert } = require("chai");

describe("SimpleStorage", function () {
  let simpleStorageFactory, simpleStorage;

  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("Should start with the favourite number of 0", async function () {
    const expectedValue = "0";
    const currentValue = await simpleStorage.retrieve();

    assert.equal(currentValue.toString(), expectedValue);
  });

  it("Should update when we call store", async function () {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);
    const currentValue = await simpleStorage.retrieve();

    assert.equal(currentValue.toString(), expectedValue);
  });

  it("Should work correctly with the people struct and array", async function () {
    const expectedPerson = {
      name: "test",
      favoriteNumber: 13,
    };

    const transactionResponse = await simpleStorage.addPerson(
      expectedPerson.name,
      expectedPerson.favoriteNumber
    );

    await transactionResponse.wait(1);
    const { name, favoriteNumber } = await simpleStorage.people(0);

    assert.equal(name, expectedPerson.name);
    assert.equal(favoriteNumber, expectedPerson.favoriteNumber);
  });
});
