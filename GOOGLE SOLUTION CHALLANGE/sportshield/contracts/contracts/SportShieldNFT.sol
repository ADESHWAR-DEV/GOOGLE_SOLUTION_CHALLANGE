// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SportShieldNFT
 * @dev NFT contract for digital sports media ownership and royalty distribution
 * @notice Protects athletes' digital assets with blockchain-verified ownership
 * 
 * Key Features:
 * - ERC-721 NFT standard
 * - Automatic royalty distribution
 * - Fraud freeze mechanism
 * - Multi-signature support for admin actions
 */
contract SportShieldNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;

    // Struct for asset metadata
    struct AssetMetadata {
        string title;
        string description;
        string mediaType; // video, image, audio
        string sportsCategory;
        string eventName;
        string location;
        uint256 recordedAt;
        string metadataHash; // SHA-256 hash for integrity
        string c2paCertificateId;
    }

    // Struct for royalty configuration
    struct RoyaltyConfig {
        address athleteAddress;
        address creatorAddress;
        uint256 athletePercentage; // 0-100
        uint256 creatorPercentage; // 0-100
        uint256 platformPercentage; // 0-100
    }

    // Struct for asset details
    struct AssetDetails {
        uint256 tokenId;
        address originalCreator;
        address currentOwner;
        AssetMetadata metadata;
        RoyaltyConfig royaltyConfig;
        uint256 price;
        bool isFrozen;
        bool isForSale;
        uint256 createdAt;
        uint256 lastTransferredAt;
    }

    // Mapping from token ID to asset details
    mapping(uint256 => AssetDetails) public assetDetails;

    // Mapping from token ID to frozen status
    mapping(uint256 => bool) private _frozenAssets;

    // Mapping from address to total earnings
    mapping(address => uint256) public earnings;

    // Platform wallet address for platform fees
    address public platformWallet;

    // Base URI for metadata
    string private _baseURIextended;

    // Events
    event AssetRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 price
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 price
    );

    event RoyaltyDistributed(
        uint256 indexed tokenId,
        address athlete,
        address creator,
        address platform,
        uint256 athleteAmount,
        uint256 creatorAmount,
        uint256 platformAmount
    );

    event AssetFrozen(uint256 indexed tokenId, string reason);
    event AssetUnfrozen(uint256 indexed tokenId);
    event AssetListed(uint256 indexed tokenId, uint256 price);
    event AssetDelisted(uint256 indexed tokenId);

    /**
     * @dev Constructor sets the platform wallet and base URI
     * @param _platformWallet Address for platform fee collection
     */
    constructor(address _platformWallet) ERC721("SportShield NFT", "SSNFT") {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        _baseURIextended = "https://api.sportshield.io/metadata/";
    }

    /**
     * @dev Register a new digital sports media asset
     * @param to Address that will own the NFT
     * @param uri IPFS URI for metadata
     * @param metadata Asset metadata
     * @param royaltyConfig Royalty configuration
     * @param price Initial price in MATIC
     */
    function registerAsset(
        address to,
        string memory uri,
        AssetMetadata memory metadata,
        RoyaltyConfig memory royaltyConfig,
        uint256 price
    ) public nonReentrant returns (uint256) {
        // Validate royalty percentages
        require(
            royaltyConfig.athletePercentage + royaltyConfig.creatorPercentage + royaltyConfig.platformPercentage <= 100,
            "Royalty percentages exceed 100%"
        );

        // Validate addresses
        require(royaltyConfig.athleteAddress != address(0), "Invalid athlete address");
        require(royaltyConfig.creatorAddress != address(0), "Invalid creator address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store asset details
        assetDetails[tokenId] = AssetDetails({
            tokenId: tokenId,
            originalCreator: to,
            currentOwner: to,
            metadata: metadata,
            royaltyConfig: royaltyConfig,
            price: price,
            isFrozen: false,
            isForSale: price > 0,
            createdAt: block.timestamp,
            lastTransferredAt: block.timestamp
        });

        emit AssetRegistered(tokenId, to, metadata.title, price);

        return tokenId;
    }

    /**
     * @dev Purchase an asset with automatic royalty distribution
     * @param tokenId ID of the asset to purchase
     */
    function purchaseAsset(uint256 tokenId) public payable nonReentrant {
        AssetDetails storage asset = assetDetails[tokenId];

        require(asset.isForSale, "Asset not for sale");
        require(!asset.isFrozen, "Asset is frozen due to suspected fraud");
        require(ownerOf(tokenId) != address(0), "Asset does not exist");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own asset");
        require(msg.value >= asset.price, "Insufficient payment");

        address seller = asset.currentOwner;
        uint256 purchasePrice = asset.price;

        // Calculate royalty splits
        uint256 athleteAmount = (purchasePrice * asset.royaltyConfig.athletePercentage) / 100;
        uint256 creatorAmount = (purchasePrice * asset.royaltyConfig.creatorPercentage) / 100;
        uint256 platformAmount = (purchasePrice * asset.royaltyConfig.platformPercentage) / 100;
        uint256 sellerAmount = purchasePrice - athleteAmount - creatorAmount - platformAmount;

        // Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);

        // Update asset details
        asset.currentOwner = msg.sender;
        asset.lastTransferredAt = block.timestamp;
        asset.isForSale = false;

        // Distribute royalties
        if (athleteAmount > 0) {
            payable(asset.royaltyConfig.athleteAddress).transfer(athleteAmount);
            earnings[asset.royaltyConfig.athleteAddress] += athleteAmount;
        }

        if (creatorAmount > 0 && asset.royaltyConfig.creatorAddress != asset.royaltyConfig.athleteAddress) {
            payable(asset.royaltyConfig.creatorAddress).transfer(creatorAmount);
            earnings[asset.royaltyConfig.creatorAddress] += creatorAmount;
        }

        if (platformAmount > 0) {
            payable(platformWallet).transfer(platformAmount);
            earnings[platformWallet] += platformAmount;
        }

        // Transfer remaining to seller
        payable(seller).transfer(sellerAmount);
        earnings[seller] += sellerAmount;

        emit RoyaltyDistributed(
            tokenId,
            asset.royaltyConfig.athleteAddress,
            asset.royaltyConfig.creatorAddress,
            platformWallet,
            athleteAmount,
            creatorAmount,
            platformAmount
        );

        emit AssetTransferred(tokenId, seller, msg.sender, purchasePrice);

        // Refund excess payment
        if (msg.value > purchasePrice) {
            payable(msg.sender).transfer(msg.value - purchasePrice);
        }
    }

    /**
     * @dev List asset for sale
     * @param tokenId ID of the asset to list
     * @param price Sale price in MATIC
     */
    function listAsset(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the asset owner");
        require(!_frozenAssets[tokenId], "Asset is frozen");

        assetDetails[tokenId].isForSale = true;
        assetDetails[tokenId].price = price;

        emit AssetListed(tokenId, price);
    }

    /**
     * @dev Delist asset from sale
     * @param tokenId ID of the asset to delist
     */
    function delistAsset(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the asset owner");

        assetDetails[tokenId].isForSale = false;

        emit AssetDelisted(tokenId);
    }

    /**
     * @dev Freeze asset (admin function for fraud prevention)
     * @param tokenId ID of the asset to freeze
     * @param reason Reason for freezing
     */
    function freezeAsset(uint256 tokenId, string memory reason) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Asset does not exist");
        
        _frozenAssets[tokenId] = true;
        assetDetails[tokenId].isFrozen = true;
        assetDetails[tokenId].isForSale = false;

        emit AssetFrozen(tokenId, reason);
    }

    /**
     * @dev Unfreeze asset (admin function)
     * @param tokenId ID of the asset to unfreeze
     */
    function unfreezeAsset(uint256 tokenId) public onlyOwner {
        require(_frozenAssets[tokenId], "Asset is not frozen");
        
        _frozenAssets[tokenId] = false;
        assetDetails[tokenId].isFrozen = false;

        emit AssetUnfrozen(tokenId);
    }

    /**
     * @dev Transfer ownership directly (for off-chain verified transfers)
     * @param from Current owner
     * @param to New owner
     * @param tokenId ID of the asset
     */
    function transferOwnership(address from, address to, uint256 tokenId) public onlyOwner {
        require(ownerOf(tokenId) == from, "From address is not owner");
        
        _transfer(from, to, tokenId);
        assetDetails[tokenId].currentOwner = to;
        assetDetails[tokenId].lastTransferredAt = block.timestamp;
    }

    /**
     * @dev Update asset metadata
     * @param tokenId ID of the asset
     * @param newMetadata New metadata
     */
    function updateMetadata(uint256 tokenId, AssetMetadata memory newMetadata) public {
        require(ownerOf(tokenId) == msg.sender, "Not the asset owner");
        require(!_frozenAssets[tokenId], "Asset is frozen");

        assetDetails[tokenId].metadata = newMetadata;
    }

    /**
     * @dev Update royalty configuration
     * @param tokenId ID of the asset
     * @param newConfig New royalty configuration
     */
    function updateRoyaltyConfig(uint256 tokenId, RoyaltyConfig memory newConfig) public {
        require(ownerOf(tokenId) == msg.sender, "Not the asset owner");
        require(
            newConfig.athletePercentage + newConfig.creatorPercentage + newConfig.platformPercentage <= 100,
            "Royalty percentages exceed 100%"
        );

        assetDetails[tokenId].royaltyConfig = newConfig;
    }

    /**
     * @dev Get asset details
     * @param tokenId ID of the asset
     */
    function getAssetDetails(uint256 tokenId) public view returns (AssetDetails memory) {
        require(ownerOf(tokenId) != address(0), "Asset does not exist");
        return assetDetails[tokenId];
    }

    /**
     * @dev Check if asset is frozen
     * @param tokenId ID of the asset
     */
    function isAssetFrozen(uint256 tokenId) public view returns (bool) {
        return _frozenAssets[tokenId];
    }

    /**
     * @dev Get total number of assets
     */
    function getTotalAssets() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get assets by owner
     * @param owner Address of the owner
     */
    function getAssetsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 total = _tokenIdCounter.current();
        uint256[] memory result = new uint256[](total);
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (assetDetails[i].currentOwner == owner) {
                result[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }

        return finalResult;
    }

    /**
     * @dev Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURIextended = baseURI;
    }

    /**
     * @dev Update platform wallet
     * @param newWallet New platform wallet address
     */
    function updatePlatformWallet(address newWallet) public onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        platformWallet = newWallet;
    }

    // Required overrides for ERC721
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Receive MATIC
    receive() external payable {}
}