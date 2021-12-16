# Auction House

This contract acts as a auction house mechanism. Auctions can be created by owner for allowed ERC721 tokens.
Proceeds (ETH) are split between owner and item creator, if a creator fee is set. Each time an auction is settled, the settlement transaction will sent the ERC721 token to highest bidder. While settlement is most heavily incentivized for the winning bidder, it can be triggered by anyone, allowing the system to trustlessly run auctions as long as Ethereum is operational and there are interested bidders.  
If a new bid is submitted within the `TimeBuffer` period the auction is extended by `TimeBuffer`, meaning auctions can only be setteles if no new bids are placed for more than `TimeBuffer` Duration.
Auctions with no bids are setteled by sending ERC721 Token to owner.

## Development

### Install dependencies

```sh
yarn
```

### Compile typescript, contracts, and generate typechain wrappers

```sh
yarn build
```

### Run tests

```sh
yarn test
```

### Local Remix Docker

```sh
docker-compose up
```

### Run coverage

```sh
yarn coverage
```

### Environment Setup

Copy `.env.example` to `.env` and fill in fields

### Commands

```sh
# compiling
npx hardhat compile

# deploying
yarn deploy --network rinkeby

# verifying on etherscan
npx hardhat verify --network rinkeby {DEPLOYED_ADDRESS}

# replace `rinkeby` with `mainnet` to productionize
```
