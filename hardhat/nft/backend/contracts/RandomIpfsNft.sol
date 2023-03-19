// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  mapping(uint256 => address) public s_requestIdToSender;

  uint256 public s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal s_dogTokenUris;
  uint256 internal immutable i_mintFee;

  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint32 callbackGasLimit,
    string[3] memory dogTokenUris,
    uint256 mintFee
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
  }

  function requestNft() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) {
      revert RandomIpfsNft__NeedMoreETHSent();
    }

    requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );

    s_requestIdToSender[requestId] = msg.sender;
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
    Breed dogBreed = getBreedFromModdedRng(moddedRng);

    _safeMint(dogOwner, newTokenId);
    // setTokenURI isn't the most gas efficient operation
    // It is used because it has most customization
    _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
  }

  function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
    uint256 cumulativeSum = 0;
    uint256[3] memory chanceArray = getChanceArray();

    for (uint256 i = 0; i < chanceArray.length; i++) {
      if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
        return Breed(i);
      }

      cumulativeSum = chanceArray[i];
    }

    revert RandomIpfsNft__RangeOutOfBounds();
  }

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{ value: amount }("");

    if (success) revert RandomIpfsNft__TransferFailed();
  }

  function getChanceArray() public pure returns (uint256[3] memory) {
    return [10, 40, MAX_CHANCE_VALUE];
  }

  function tokenURI(uint256) public view override returns (string memory) {}
}
