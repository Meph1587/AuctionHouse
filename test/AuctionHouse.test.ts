import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { constants } from 'ethers';
import { ethers } from 'hardhat';
import {
  AuctionHouse,
  AuctionToken,
  WethMock,
} from '../typechain';

import {deployContract} from "../helpers/deploy"
import * as chain from "../helpers/chain"
import { expect } from 'chai';

describe('AuctionHouse', () => {
  let auctionHouse: AuctionHouse;
  let auctionToken1: AuctionToken;
  let auctionToken2: AuctionToken;
  let weth: WethMock;
  let deployer: SignerWithAddress;
  let bidderA: SignerWithAddress;
  let bidderB: SignerWithAddress;
  let creator: SignerWithAddress;
  let snapshotId: number;

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;


  before(async () => {
    [deployer, bidderA, bidderB, creator] = await ethers.getSigners();

    auctionToken1 = await deployContract("AuctionToken") as AuctionToken;
    auctionToken2 = await deployContract("AuctionToken") as AuctionToken;
    weth = await deployContract("WethMock") as WethMock;
    auctionHouse = await deployContract('AuctionHouse') as AuctionHouse;

    await auctionHouse.connect(deployer).initialize(
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    );

    await auctionHouse.enableToken(auctionToken1.address)

    await auctionToken1.mint(0)
    await auctionToken1.mint(1)
    await auctionToken1.setApprovalForAll(auctionHouse.address, true);


    await auctionToken2.mint(0)
    await auctionToken2.setApprovalForAll(auctionHouse.address, true);

  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  it('should revert if a second initialization is attempted', async () => {
    const tx = auctionHouse.connect(deployer).initialize(
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    );
    await expect(tx).to.be.revertedWith('Initializable: contract is already initialized');

  });

  it('should allow the owner to unpause the contract and create the first auction', async () => {
    const tx = await auctionHouse.connect(deployer).unpause();
    await tx.wait();

    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const auction = await auctionHouse.connect(deployer).auction();
    expect(auction.startTime.toNumber()).to.be.greaterThan(0);
  });


  it('should revert if auction for disabled token is made', async () => {
    await (await auctionHouse.unpause()).wait();

    const tx = auctionHouse.createNewAuction(auctionToken2.address, 0, creator.address, 0)
    await expect(tx)
    .to.be.revertedWith('Token not enabled for auction')

  });

  it('should allow enabling more tokens', async () => {
    await (await auctionHouse.unpause()).wait();

    await auctionHouse.enableToken(auctionToken2.address)

    await auctionHouse.createNewAuction(auctionToken2.address, 0, creator.address, 0)
    const auction = await auctionHouse.connect(deployer).auction();
    expect(auction.startTime.toNumber()).to.be.greaterThan(0);
  });

  it('should allow disabling tokens', async () => {
    await (await auctionHouse.unpause()).wait();

    await auctionHouse.disableToken(auctionToken1.address)

    let tx =  auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)
    await expect(tx)
    .to.be.revertedWith('Token not enabled for auction')
  });

  it('should not create a new auction if the auction house has ongoing auction', async () => {
    await (await auctionHouse.unpause()).wait();

    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    let tx = auctionHouse.createNewAuction(auctionToken1.address, 1, deployer.address, 0)

    await expect(tx)
    .to.be.revertedWith('Previous Auction not setteled')


    const { tokenId } = await auctionHouse.auction();

    expect(tokenId).to.equal(0);
  });

  it('should allow to settle auction after bidding period', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 10)

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: 10000,
    });

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours

    const deployerBalBefore = await deployer.getBalance();
    const creatorBalBefore = await creator.getBalance();

    await auctionHouse.connect(bidderA).settleAuction();

    //winning bid takes token
    const ownerOf =  await auctionToken1.ownerOf(0)
    expect(ownerOf).to.equal(bidderA.address);

    // ETH gets split between owner and creator
    expect(await deployer.getBalance()).to.equal(deployerBalBefore.add(9990));
    expect(await creator.getBalance()).to.equal(creatorBalBefore.add(10));
  });


  it('should allow to settle when paused', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 10)

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: 10000,
    });

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours

    await auctionHouse.pause()

    await auctionHouse.settleAuction();
    const { settled } = await auctionHouse.auction();
    expect(settled).to.be.true
  });

  it('should revert when trying to settle auction again', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 10)

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: 10000,
    });

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours

    await auctionHouse.settleAuction();
    const { settled } = await auctionHouse.auction();
    expect(settled).to.be.true

    const tx = auctionHouse.settleAuction();
    await expect(tx).to.be.revertedWith("Auction has already been settled");
  });



  it('should send Token to owner on auction settlement if no bids are received', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours

    const tx = auctionHouse.connect(bidderA).settleAuction();

    await expect(tx)
      .to.emit(auctionHouse, 'AuctionSettled')
      .withArgs(tokenId, "0x0000000000000000000000000000000000000000", 0);

      //winning bid takes token
    const ownerOf =  await auctionToken1.ownerOf(0)
    expect(ownerOf).to.equal(deployer.address);
  });


  it('should revert if auction settlement is attempted while the auction is still active', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });
    const tx = auctionHouse.connect(bidderA).settleAuction();

    await expect(tx).to.be.revertedWith("Auction hasn't completed");
  });

  it('should revert if a user creates a bid for an inactive auction', async () => {
    await (await auctionHouse.unpause()).wait();

    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    
    const { tokenId } = await auctionHouse.connect(deployer).auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId.add(1), {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('Token not up for auction');
  });

  it('should revert if a user creates a bid for an expired auction', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await expect(tx).to.be.revertedWith('Auction expired');
  });

  it('should revert if a user creates a bid with an amount below the reserve price', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE - 1,
    });

    await expect(tx).to.be.revertedWith('Must send at least reservePrice');
  });

  it('should revert if a user creates a bid less than the min bid increment percentage', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();
    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE * 50,
    });
    const tx = auctionHouse.connect(bidderB).createBid(tokenId, {
      value: RESERVE_PRICE * 51,
    });

    await expect(tx).to.be.revertedWith(
      'Must send more than last bid by minBidIncrementPercentage amount',
    );
  });

  it('should refund the previous bidder when the following user creates a bid', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();
    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    const bidderAPostBidBalance = await bidderA.getBalance();
    await auctionHouse.connect(bidderB).createBid(tokenId, {
      value: RESERVE_PRICE * 2,
    });
    const bidderAPostRefundBalance = await bidderA.getBalance();

    expect(bidderAPostRefundBalance).to.equal(bidderAPostBidBalance.add(RESERVE_PRICE));
  });


  it('should extend auction if bid is submitted in time buffer', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    let { tokenId, endTime } = await auctionHouse.auction();

    await ethers.provider.send('evm_setNextBlockTimestamp', [endTime.sub(60 * 5).toNumber()]); // Subtract 5 mins from current end time

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    let auction = await auctionHouse.auction();
    let ts = await chain.getLatestBlockTimestamp()
    expect(auction.endTime).to.be.eq(ts + TIME_BUFFER)

  });


  it('should allow DAO to update params', async () => {
   await auctionHouse.setMinBidIncrementPercentage(1)
   expect(await auctionHouse.minBidIncrementPercentage()).to.be.eq(1)


   await auctionHouse.setTimeBuffer(1)
   expect(await auctionHouse.timeBuffer()).to.be.eq(1)


   await auctionHouse.setReservePrice(1)
   expect(await auctionHouse.reservePrice()).to.be.eq(1)

  });


  it('should emit an `AuctionBid` event on a successful bid', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();
    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await expect(tx)
      .to.emit(auctionHouse, 'AuctionBid')
      .withArgs(tokenId, bidderA.address, RESERVE_PRICE, false);
  });

  it('should emit an `AuctionExtended` event if the auction end time is within the time buffer', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId, endTime } = await auctionHouse.auction();

    await ethers.provider.send('evm_setNextBlockTimestamp', [endTime.sub(60 * 5).toNumber()]); // Subtract 5 mins from current end time

    const tx = auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await expect(tx)
      .to.emit(auctionHouse, 'AuctionExtended')
      .withArgs(tokenId, endTime.add(60 * 10));
  });

  it('should emit `AuctionCreated` events if all conditions are met', async () => {
    await (await auctionHouse.unpause()).wait();
    const tokenId = 0;

    const tx = await auctionHouse.createNewAuction(auctionToken1.address, tokenId, deployer.address, 0)

    const receipt = await tx.wait();
    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

    const settledEvent = receipt.events?.find(e => e.event === 'AuctionCreated');

    expect(settledEvent?.args?.tokenId).to.equal(tokenId);
    expect(settledEvent?.args?.startTime).to.equal(timestamp);
    expect(settledEvent?.args?.endTime).to.equal(timestamp + DURATION);
  });

  it('should emit `AuctionSettled` events if all conditions are met', async () => {
    await (await auctionHouse.unpause()).wait();
    await auctionHouse.createNewAuction(auctionToken1.address, 0, creator.address, 0)

    const { tokenId } = await auctionHouse.auction();

    await auctionHouse.connect(bidderA).createBid(tokenId, {
      value: RESERVE_PRICE,
    });

    await chain.increaseTime(60 * 60 * 25); // Add 25 hours
    const tx = await auctionHouse.connect(bidderA).settleAuction();

    const receipt = await tx.wait();
    const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

    const settledEvent = receipt.events?.find(e => e.event === 'AuctionSettled');

    expect(settledEvent?.args?.tokenId).to.equal(tokenId);
    expect(settledEvent?.args?.winner).to.equal(bidderA.address);
    expect(settledEvent?.args?.amount).to.equal(RESERVE_PRICE);
  });
});