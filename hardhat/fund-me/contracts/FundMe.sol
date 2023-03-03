// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
  using PriceConverter for uint256;

  address[] public funders;
  address public i_owner;
  AggregatorV3Interface public i_priceFeedAddress;
  uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
  mapping(address => uint256) public addressToAmountFunded;

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    i_priceFeedAddress = AggregatorV3Interface(priceFeedAddress);
  }

  function fund() public payable {
    require(
      msg.value.getConversionRate(i_priceFeedAddress) >= MINIMUM_USD,
      "You need to spend more ETH!"
    );
    addressToAmountFunded[msg.sender] += msg.value;
    funders.push(msg.sender);
  }

  function getVersion() public view returns (uint256) {
    return i_priceFeedAddress.version();
  }

  modifier onlyOwner() {
    if (msg.sender != i_owner) revert NotOwner();
    _;
  }

  function withdraw() public onlyOwner {
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      addressToAmountFunded[funder] = 0;
    }

    funders = new address[](0);

    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  fallback() external payable {
    fund();
  }

  receive() external payable {
    fund();
  }
}
