// SPDX-License-Identifier: GPL-3.0

/// @title An ERC721 auction house

/*********************************
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWNKOOKXNWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWXxllloxxk0XWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWN0xocloloddddx0NWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWXklc:;codoooodddxKWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWNKOdool;;coxdooooooxKWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWKOOkkOOxddc;:cloooolclOWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWNKOdox0XNN0xxxoc:::::loxONWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWN0o:;:lxKNX0kxxkxdolcc:oKWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWKdlc:;:ldkkkk0XNXOxooldKWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWXxldoc;;clox0XNX00OOOOkOXWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWKdoxkoc;;:codkxdx00000OkOXWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWNOdxxxoc:;;lOXKOdkO000OOk0XWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWXOxdoollokNWWWXkxdk000OxdOXWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWXK00KNWWWWWWWWXOdxkoclodONWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXko:::ccldOXWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOo::::cldOXWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWXOl:;;:ccoOXWWWWWWWWWWW
WWWWWWWNNNNXXXXXXXXNXXXXNNWWWWWWWWWWWWWXkl:;;::coOXWWWWWWWWW
WWWNXKKKXXXXXXXXNXXKK0OOkkO0XWWWWWWWWWWWWXkl;;;;:coOXWWWWWWW
WWW0k0XXXXXXXWNNXKK00OkkxdoodKWWWWWWWWWWWWWXkl;;;;;:oOXWWWWW
WWNkldOKXNNNNNNXKK00OOkxxdoclOWWWWWWWWWWWWWWWXkl;,,;;:lkXWWW
WWW0oox0XNNNX0OO0KKXXXXK0kdlo0NNNNNNNNNNNNWWWWWXkc,,,,,c0WWW
WWWWNK0KKXXXOdoodk0KXXXK0OkO00000000000KKKXXXNNWWXkc;:o0NWWW
WWWWWWWWWNNNXXKKKXXXXNNNWWWWWNNNNNNNNNNWWWWWWWWWWWWX0KNWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
*********************************/

// LICENSE
// AuctionHouse.sol is a modified version of NounsDAO NounsAuctionHouse.sol:
// https://github.com/nounsDAO/nouns-monorepo/blob/2cbe6c7bdfee258e646e8d9e84302375320abc72/packages/nouns-contracts/contracts/NounsAuctionHouse.sol

// NounsAuctionHouse.sol source code Copyright licensed under the GPL-3.0 license.
// With modifications by Mephistopheles.

pragma solidity ^0.8.6;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IAuctionHouse} from "../interfaces/IAuctionHouse.sol";
import {IWETH} from "../interfaces/IWETH.sol";

contract AuctionHouse is
    IAuctionHouse,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable
{
    uint256 public FULL_BASIS_POINTS = 10000;

    using SafeMath for uint256;

    // The list of ERC721 token contracts allowed to be auctioned
    mapping(address => bool) public enabledToken;

    // The address of the WETH contract
    address public weth;

    // The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    // The minimum price accepted in an auction
    uint256 public reservePrice;

    // The minimum percentage difference between the last bid amount and the current bid
    uint8 public minBidIncrementPercentage;

    // The duration of a single auction
    uint256 public duration;

    // The active auction
    IAuctionHouse.Auction public auction;

    /**
     * @notice Initialize the auction house and base contracts,
     * populate configuration values, and pause the contract.
     * @dev This function can only be called once.
     */
    function initialize(
        address _weth,
        uint256 _timeBuffer,
        uint256 _reservePrice,
        uint8 _minBidIncrementPercentage,
        uint256 _duration
    ) external initializer {
        __Pausable_init();
        __ReentrancyGuard_init();
        __Ownable_init();

        _pause();

        weth = _weth;
        timeBuffer = _timeBuffer;
        reservePrice = _reservePrice;
        minBidIncrementPercentage = _minBidIncrementPercentage;
        duration = _duration;

        auction.settled = true;
    }

    /**
     * @notice Start new auction.
     */
    function createNewAuction(
        address tokenAddress,
        uint256 tokenId,
        address creator,
        uint256 creatorFee
    ) external override nonReentrant whenNotPaused onlyOwner {
        _createAuction(tokenAddress, tokenId, creator, creatorFee);
    }

    /**
     * @notice Settle the current auction.
     * @dev This function can only be called when the contract is paused.
     */
    function settleAuction() external override nonReentrant {
        _settleAuction();
    }

    /**
     * @notice Create a bid for a Token, with a given amount.
     * @dev This contract only accepts payment in ETH.
     */
    function createBid(uint256 tokenId) external payable override nonReentrant {
        IAuctionHouse.Auction memory _auction = auction;

        require(_auction.tokenId == tokenId, "Token not up for auction");
        require(block.timestamp < _auction.endTime, "Auction expired");
        require(msg.value >= reservePrice, "Must send at least reservePrice");
        require(
            msg.value >=
                _auction.amount +
                    ((_auction.amount * minBidIncrementPercentage) / 100),
            "Must send more than last bid by minBidIncrementPercentage amount"
        );

        address payable lastBidder = _auction.bidder;

        // Refund the last bidder, if applicable
        if (lastBidder != address(0)) {
            _safeTransferETHWithFallback(lastBidder, _auction.amount);
        }

        auction.amount = msg.value;
        auction.bidder = payable(msg.sender);

        // Extend the auction if the bid was received within `timeBuffer` of the auction end time
        bool extended = _auction.endTime - block.timestamp < timeBuffer;
        if (extended) {
            auction.endTime = _auction.endTime = block.timestamp + timeBuffer;
        }

        emit AuctionBid(_auction.tokenId, msg.sender, msg.value, extended);

        if (extended) {
            emit AuctionExtended(_auction.tokenId, _auction.endTime);
        }
    }

    /**
     * @notice Pause the token auction house.
     * @dev This function can only be called by the owner when the
     * contract is unpaused. While no new auctions can be started when paused,
     * anyone can settle an ongoing auction.
     */
    function pause() external override onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the token auction house.
     * @dev This function can only be called by the owner when the
     * contract is paused.
     */
    function unpause() external override onlyOwner {
        _unpause();
    }

    /**
     * @notice Set the auction time buffer.
     * @dev Only callable by the owner.
     */
    function setTimeBuffer(uint256 _timeBuffer) external override onlyOwner {
        timeBuffer = _timeBuffer;

        emit AuctionTimeBufferUpdated(_timeBuffer);
    }

    /**
     * @notice Set the auction reserve price.
     * @dev Only callable by the owner.
     */
    function setReservePrice(uint256 _reservePrice)
        external
        override
        onlyOwner
    {
        reservePrice = _reservePrice;

        emit AuctionReservePriceUpdated(_reservePrice);
    }

    /**
     * @notice Set the auction minimum bid increment percentage.
     * @dev Only callable by the owner.
     */
    function setMinBidIncrementPercentage(uint8 _minBidIncrementPercentage)
        external
        override
        onlyOwner
    {
        minBidIncrementPercentage = _minBidIncrementPercentage;

        emit AuctionMinBidIncrementPercentageUpdated(
            _minBidIncrementPercentage
        );
    }

    /**
     * @notice Enables a token to be sold for auction
     * @dev Only callable by the owner.
     */
    function enableToken(address tokenAddress) external override onlyOwner {
        enabledToken[tokenAddress] = true;

        emit TokenEnabledForAuction(tokenAddress);
    }

    /**
     * @notice Disables a token to be sold for auction
     * @dev Only callable by the owner.
     */
    function disableToken(address tokenAddress) external override onlyOwner {
        enabledToken[tokenAddress] = false;

        emit TokenDisabledForAuction(tokenAddress);
    }

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the `auction` state variable and emit an AuctionCreated event.
     * If the mint reverts, the minter was updated without pausing this contract first. To remedy this,
     * catch the revert and pause this contract.
     */
    function _createAuction(
        address tokenAddress,
        uint256 tokenId,
        address creator,
        uint256 creatorFee
    ) internal {
        require(enabledToken[tokenAddress], "Token not enabled for auction");

        require(auction.settled, "Previous Auction not setteled");

        IERC721(tokenAddress).transferFrom(owner(), address(this), tokenId);
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        auction = Auction({
            creator: creator,
            creatorFee: creatorFee,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            amount: 0,
            startTime: startTime,
            endTime: endTime,
            bidder: payable(0),
            settled: false
        });

        emit AuctionCreated(tokenId, startTime, endTime);
    }

    /**
     * @notice Settle an auction, finalizing the bid and paying out to the owner() and the item creator.
     * @dev If there are no bids, the Token is burned.
     */
    function _settleAuction() internal {
        IAuctionHouse.Auction memory _auction = auction;

        require(_auction.startTime != 0, "Auction hasn't begun");
        require(!_auction.settled, "Auction has already been settled");
        require(
            block.timestamp >= _auction.endTime,
            "Auction hasn't completed"
        );

        auction.settled = true;

        if (_auction.bidder == address(0)) {
            IERC721(auction.tokenAddress).transferFrom(
                address(this),
                owner(),
                _auction.tokenId
            );
        } else {
            IERC721(auction.tokenAddress).transferFrom(
                address(this),
                _auction.bidder,
                _auction.tokenId
            );
        }

        if (_auction.amount > 0) {
            // send % creator fee to creator
            _safeTransferETHWithFallback(
                _auction.creator,
                _auction.amount.mul(_auction.creatorFee).div(FULL_BASIS_POINTS)
            );
            // send remaining % to owner
            _safeTransferETHWithFallback(
                owner(),
                _auction
                    .amount
                    .mul(FULL_BASIS_POINTS - _auction.creatorFee)
                    .div(FULL_BASIS_POINTS)
            );
        }

        emit AuctionSettled(_auction.tokenId, _auction.bidder, _auction.amount);
    }

    /**
     * @notice Transfer ETH. If the ETH transfer fails, wrap the ETH and try send it as WETH.
     */
    function _safeTransferETHWithFallback(address to, uint256 amount) internal {
        if (!_safeTransferETH(to, amount)) {
            IWETH(weth).deposit{value: amount}();
            IERC20(weth).transfer(to, amount);
        }
    }

    /**
     * @notice Transfer ETH and return the success status.
     * @dev This function only forwards 30,000 gas to the callee.
     */
    function _safeTransferETH(address to, uint256 value)
        internal
        returns (bool)
    {
        (bool success, ) = to.call{value: value, gas: 30_000}(new bytes(0));
        return success;
    }
}
