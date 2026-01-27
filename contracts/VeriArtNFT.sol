// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VeriArtNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Organization registry
    mapping(address => bool) public isOrg;
    mapping(address => string) public orgNames;

    // Expiry + Revocation + Issuer
    // expiry[tokenId] = unix timestamp (0 => never)
    mapping(uint256 => uint256) public expiry;
    mapping(uint256 => bool) public revoked;
    mapping(uint256 => address) public issuerOf;

    // Events
    event OrganizationAdded(address indexed org, string name);
    event OrganizationRemoved(address indexed org);

    event DocumentIssued(
        address indexed org,
        address indexed recipient,
        uint256 indexed tokenId,
        string uri,
        uint256 expiryTimestamp
    );

    event DocumentRevoked(uint256 indexed tokenId, address indexed revokedBy);
    event ExpiryUpdated(uint256 indexed tokenId, uint256 newExpiry);

    modifier onlyOrg() {
        require(isOrg[msg.sender], "Not an approved organization");
        _;
    }

    constructor() 
    ERC721("VeriArt", "VART") 
      Ownable(msg.sender)
    {}


    // Admin: add organization
    function addOrganization(address org, string memory name) public onlyOwner {
        require(org != address(0), "Invalid address");
        isOrg[org] = true;
        orgNames[org] = name;
        emit OrganizationAdded(org, name);
    }

    // Admin: remove organization
    function removeOrganization(address org) public onlyOwner {
        isOrg[org] = false;
        delete orgNames[org];
        emit OrganizationRemoved(org);
    }

    /**
     * @notice Mint a new certificate NFT. Only approved organizations can call.
     * @param recipient Recipient address that will own the token.
     * @param tokenURI Metadata URI (e.g., ipfs://...)
     * @param expiryTimestamp Unix timestamp when the document expires. Use 0 for 'never'.
     */
    function safeMint(
        address recipient,
        string memory tokenURI,
        uint256 expiryTimestamp
    ) public onlyOrg returns (uint256) {
        _tokenIds++;
        uint256 tokenId = _tokenIds;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        expiry[tokenId] = expiryTimestamp;
        issuerOf[tokenId] = msg.sender;

        emit DocumentIssued(msg.sender, recipient, tokenId, tokenURI, expiryTimestamp);

        return tokenId;
    }

    /**
     * @notice Revoke a token. Can be performed by contract owner or any registered organization.
     * Emits DocumentRevoked.
     */
    function revokeDocument(uint256 tokenId) public {
       require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        require(
            msg.sender == owner() || isOrg[msg.sender],
            "Not authorized to revoke"
        );

        revoked[tokenId] = true;
        emit DocumentRevoked(tokenId, msg.sender);
    }

    /**
     * @notice Update expiry timestamp for a token. Only organizations may update.
     * @param tokenId token id
     * @param newExpiry unix timestamp (0 => never)
     */
    function updateExpiry(uint256 tokenId, uint256 newExpiry) public onlyOrg {
       require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        expiry[tokenId] = newExpiry;
        emit ExpiryUpdated(tokenId, newExpiry);
    }

    /**
     * @notice Returns true if the token is expired (on-chain check).
     */
    function isExpired(uint256 tokenId) public view returns (bool) {
        uint256 exp = expiry[tokenId];
        if (exp == 0) return false; // never expires
        return block.timestamp > exp;
    }

    /**
     * @notice Convenience view: is token revoked?
     */
    function isRevoked(uint256 tokenId) public view returns (bool) {
        return revoked[tokenId];
    }

    /**
     * @notice Total NFTs issued (simple incremental counter).
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
