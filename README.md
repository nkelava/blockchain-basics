# blockchain-basics

A collection of small, self-contained Ethereum projects written while learning smart contract development. Each folder is an independent project with its own Solidity contracts, deploy scripts and (in most cases) tests, built with [Hardhat](https://hardhat.org/) and [ethers.js v5](https://docs.ethers.org/v5/).

The projects go roughly from simplest to most involved: deploying a contract with raw ethers.js, a Hardhat workflow with tests and custom tasks, Chainlink price feeds, an ERC-20 token, a provably random lottery with Chainlink VRF and Automation, three flavours of NFT, an NFT marketplace and a script that borrows from Aave on a forked mainnet.

## Projects

| Project | What it covers |
| --- | --- |
| [`ethers-simple-storage`](ethers-simple-storage) | Compile `SimpleStorage.sol` with `solcjs` and deploy it with plain ethers.js, no framework. |
| [`hardhat/simple-storage`](hardhat/simple-storage) | Same contract in Hardhat: deploy script, unit tests, Etherscan verification and a custom `block-number` task. |
| [`hardhat/fund-me`](hardhat/fund-me) | `FundMe` crowdfunding contract with a USD minimum enforced through a Chainlink price feed (mocked locally), plus a vanilla HTML/JS client for funding and withdrawing via MetaMask. |
| [`hardhat/erc20`](hardhat/erc20) | Two ERC-20 tokens: `MyToken` built on OpenZeppelin and `ManualToken` written by hand. |
| [`hardhat/lottery`](hardhat/lottery) | `Raffle` contract that picks a random winner with Chainlink VRF v2 and Chainlink Automation, and a Next.js client (react-moralis, web3uikit) for entering the raffle. |
| [`hardhat/nft/basics`](hardhat/nft/basics) | `BasicNft`, `RandomIpfsNft` (VRF-chosen dog breed, metadata on IPFS via Pinata) and `DynamicSvgNft` (on-chain SVG that changes with the ETH/USD price). |
| [`hardhat/nft/marketplace`](hardhat/nft/marketplace) | `NftMarketplace` contract: list, buy, update and cancel listings, and withdraw proceeds. |
| [`hardhat/DeFi`](hardhat/DeFi) | Scripts that wrap ETH into WETH, deposit it to Aave v2, borrow DAI and repay, on a local fork of mainnet. |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) — the npm scripts call `pnpm exec`, so pnpm is the expected package manager
- [Git](https://git-scm.com/)
- For testnet deploys: an RPC endpoint (e.g. Alchemy or Infura), a funded wallet private key and, optionally, an Etherscan API key
- For the front-ends: a browser wallet such as MetaMask

## Getting started

Every project installs and runs on its own. Clone the repository, then `cd` into the project you want:

```bash
git clone https://github.com/nkelava/blockchain-basics.git
cd blockchain-basics/hardhat/fund-me/server
pnpm install
cp .env.example .env   # where an .env.example exists; fill in your values
```

Nothing needs a `.env` file for local work on the built-in Hardhat network; it is only required for testnets, mainnet forking and API-backed extras.

### Common commands (Hardhat projects)

```bash
pnpm exec hardhat compile
pnpm exec hardhat test
pnpm exec hardhat coverage
pnpm exec hardhat node                         # local chain at http://127.0.0.1:8545
pnpm exec hardhat deploy                       # hardhat-deploy projects
pnpm exec hardhat deploy --tags mocks          # run only deploy scripts with a given tag
pnpm exec hardhat deploy --network <network>   # networks are defined in hardhat.config.js
```

Projects that use `hardhat-deploy` (everything except `simple-storage` and `DeFi`) deploy Chainlink mocks automatically on `hardhat`/`localhost`, so contracts depending on price feeds or VRF work locally without a testnet.

## Usage

### ethers-simple-storage

```bash
cd ethers-simple-storage
pnpm install
pnpm compile      # writes SimpleStorage_sol_SimpleStorage.abi / .bin
pnpm run deploy   # deploys to RPC_URL, stores 7 and reads it back
```

Run a local chain (for example `pnpm exec hardhat node` from another project, or Ganache) and point `RPC_URL` and `PRIVATE_KEY` at it.

### hardhat/simple-storage

```bash
pnpm hardhat-start                       # deploy on the in-process Hardhat network
pnpm node-start                          # in a second terminal: start a local node
pnpm localhost-start                     # deploy to it (needs LOCALHOST_RPC_URL)
pnpm goerli-start                        # deploy to Goerli and verify on Etherscan
pnpm exec hardhat block-number           # custom task: print the current block number
pnpm test
```

### hardhat/fund-me

```bash
cd hardhat/fund-me/server
pnpm install
pnpm test                    # unit tests against mocks
pnpm node:start              # local node, deploys contracts on start
pnpm exec hardhat run scripts/fund.js --network localhost
pnpm exec hardhat run scripts/withdraw.js --network localhost
```

The client in `hardhat/fund-me/client` is plain HTML and ES modules. Serve the folder with any static file server, connect MetaMask to the local node (chain ID 31337) and use the Connect / Fund / Withdraw buttons. The contract address it talks to is set in `client/consts.js`; update it if your deployment address differs.

### hardhat/lottery

```bash
cd hardhat/lottery/server
pnpm install
pnpm exec hardhat test
pnpm exec hardhat node                                          # deploys mocks + Raffle
pnpm exec hardhat run scripts/enter.js --network localhost      # enter the raffle
pnpm exec hardhat run scripts/mockOffchain.js --network localhost  # simulate Automation + VRF and pick a winner
```

With `UPDATE_CLIENT` set, deploying also writes the Raffle ABI and address into `client/src/constants/`. Then start the front-end:

```bash
cd ../client
pnpm install
pnpm dev     # http://localhost:3000
```

### hardhat/nft/basics

```bash
pnpm exec hardhat deploy                 # mocks, the three NFT contracts, then mints one of each
pnpm exec hardhat deploy --tags main     # deploy without minting
```

By default `RandomIpfsNft` uses token URIs that are already pinned on IPFS. Set `UPLOAD_TO_PINATA=true` to upload the images in `images/randomNft` and their metadata to Pinata instead.

### hardhat/nft/marketplace

```bash
cd hardhat/nft/marketplace/backend
pnpm install
pnpm test
pnpm run deploy
pnpm lint
```

### hardhat/DeFi

The Hardhat network in this project forks Ethereum mainnet, so `MAINNET_RPC_URL` (or `ALCHEMY_MAINNET_RPC_URL`) must be set to an archive-capable RPC URL.

```bash
pnpm exec hardhat run scripts/aaveBorrow.js  # wrap ETH to WETH, deposit to Aave, borrow DAI, repay
```

## Configuration

Settings are read from a `.env` file in each project's folder via `dotenv`. Check that project's `.env.example` (or its `hardhat.config.js` for `fund-me/server` and `simple-storage`, which have none) for the exact list.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `RPC_URL`, `PRIVATE_KEY` | ethers-simple-storage | Node to deploy to and the deploying account |
| `GOERLI_RPC_URL`, `GOERLI_PRIVATE_KEY` | simple-storage, fund-me, erc20, lottery, DeFi | Goerli network access |
| `LOCALHOST_RPC_URL` | simple-storage | URL of a local node, e.g. `http://127.0.0.1:8545` |
| `SEPOLIA_RPC_URL`, `PRIVATE_KEY` | nft/basics, nft/marketplace | Sepolia network access |
| `MAINNET_RPC_URL` / `ALCHEMY_MAINNET_RPC_URL` | DeFi, nft/basics, nft/marketplace | Mainnet RPC (required for the DeFi fork) |
| `POLYGON_MAINNET_RPC_URL`, `POLYGONSCAN_API_KEY` | nft/marketplace | Polygon network and verification |
| `ETHERSCAN_API_KEY` | all Hardhat projects | Contract verification on live networks |
| `REPORT_GAS` | erc20, lottery, nft, DeFi | Enable the gas reporter (writes `gas-report.txt`; always on in fund-me) |
| `COINMARKETCAP_API_KEY` | simple-storage | USD prices in the gas report (read but commented out elsewhere) |
| `UPDATE_CLIENT` | lottery | Copy the Raffle ABI and address into the Next.js client on deploy (any non-empty value enables it) |
| `PINATA_API_KEY`, `PINATA_API_SECRET`, `UPLOAD_TO_PINATA` | nft/basics | Upload NFT images and metadata to Pinata |

Testnet-specific values such as Chainlink VRF subscription IDs, gas lanes, price feed addresses and Aave/WETH/DAI addresses live in each project's `helper-hardhat-config.js`.

> Never commit your `.env` file or use a private key that holds real funds. The `.gitignore` files already exclude `.env`.

## Repository structure

```text
blockchain-basics/
├── ethers-simple-storage/      # SimpleStorage deployed with raw ethers.js + solcjs
└── hardhat/
    ├── simple-storage/         # Hardhat basics: scripts, tests, custom task
    ├── fund-me/
    │   ├── server/             # FundMe contract, Chainlink price feed, tests
    │   └── client/             # Static HTML/JS front-end
    ├── erc20/                  # OpenZeppelin and hand-written ERC-20 tokens
    ├── lottery/
    │   ├── server/             # Raffle contract (Chainlink VRF + Automation)
    │   └── client/             # Next.js front-end
    ├── nft/
    │   ├── basics/             # Basic, random IPFS and dynamic SVG NFTs
    │   └── marketplace/
    │       └── backend/        # NftMarketplace contract and tests
    └── DeFi/                   # Aave v2 borrowing scripts on a mainnet fork
```

A typical Hardhat project inside it looks like this:

```text
project/
├── contracts/                  # Solidity sources; contracts/test/ holds mocks
├── deploy/                     # hardhat-deploy scripts, run in numeric order
├── scripts/                    # One-off scripts run with `hardhat run`
├── test/
│   ├── unit/                   # Fast tests on the local Hardhat network
│   └── staging/                # Tests meant for a live testnet
├── utils/verify.js             # Etherscan verification helper
├── helper-hardhat-config.js    # Per-network addresses and parameters
├── hardhat.config.js
└── .env.example
```

## Notes

- Several projects target Goerli, which has since been deprecated. To use another testnet, add it to `networks` in `hardhat.config.js` and its addresses to `helper-hardhat-config.js`.
- No lockfiles are committed, so `pnpm install` resolves the latest versions allowed by each `package.json`.
