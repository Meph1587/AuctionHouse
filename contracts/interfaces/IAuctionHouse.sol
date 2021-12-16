// SPDX-License-Identifier: GPL-3.0

/// @title Interface for AuctionHouse

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

pragma solidity ^0.8.6;

interface IAuctionHouse {
    struct Auction {
        // Address of the Token Creator who gets a portion of proceeds
        address creator;
        // percentage in basis-points of proceeds creator recievs
        uint256 creatorFee;
        // Address of the Token (ERC721)
        address tokenAddress;
        // ID for the Token (ERC721 token ID)
        uint256 tokenId;
        // The current highest bid amount
        uint256 amount;
        // The time that the auction started
        uint256 startTime;
        // The time that the auction is scheduled to end
        uint256 endTime;
        // The address of the current highest bid
        address payable bidder;
        // Whether or not the auction has been settled
        bool settled;
    }

    event AuctionCreated(
        uint256 indexed tokenId,
        uint256 startTime,
        uint256 endTime
    );

    event AuctionBid(
        uint256 indexed tokenId,
        address sender,
        uint256 value,
        bool extended
    );

    event AuctionExtended(uint256 indexed tokenId, uint256 endTime);

    event AuctionSettled(
        uint256 indexed tokenId,
        address winner,
        uint256 amount
    );

    event AuctionTimeBufferUpdated(uint256 timeBuffer);

    event AuctionReservePriceUpdated(uint256 reservePrice);

    event AuctionMinBidIncrementPercentageUpdated(
        uint256 minBidIncrementPercentage
    );

    event TokenEnabledForAuction(address indexed tokenAddress);

    event TokenDisabledForAuction(address indexed tokenAddress);

    function settleAuction() external;

    function createNewAuction(
        address tokenAddress,
        uint256 tokenId,
        address creator,
        uint256 creatorFee
    ) external;

    function createBid(uint256 tokenId) external payable;

    function pause() external;

    function unpause() external;

    function enableToken(address tokenAddress) external;

    function disableToken(address tokenAddress) external;

    function setTimeBuffer(uint256 timeBuffer) external;

    function setReservePrice(uint256 reservePrice) external;

    function setMinBidIncrementPercentage(uint8 minBidIncrementPercentage)
        external;
}
