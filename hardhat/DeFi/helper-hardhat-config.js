const networkConfig = {
  31337: {
    name: "localhost",
    wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
    daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xd4a33860578de61dbabdc8bfdb98fd742fa7028e",
    wethToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    lendingPoolAddressesProvider: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
    daiEthPriceFeed: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d",
    daiToken: "0x73967c6a0904aA032C103b4104747E88c566B1A2",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
