// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeriArt
 * @dev A blockchain-based art authenticity registry.
 * Each artwork is registered with metadata stored on IPFS,
 * and an NFT certificate is minted to represent its authenticity.
 */
contract VeriArt is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Artwork {
        string title;
        string artistName;
        string ipfsCID;     // Points to IPFS metadata (JSON or image)
        uint256 timestamp;  // Block time of registration
        address owner;      // Current owner of the certificate
    }

    mapping(uint256 => Artwork) public artworks;

    event ArtworkRegistered(
        uint256 indexed tokenId,
        string title,
        string artistName,
        string ipfsCID,
        address indexed owner
    );

    constructor() ERC721("VeriArt Certificate", "VART") Ownable(msg.sender) {}

    /**
     * @dev Register a new artwork and mint its authenticity certificate.
     * @param title Title of the artwork
     * @param artistName Artist’s name
     * @param ipfsCID IPFS CID for metadata or image
     */
    function registerArtwork(
        string memory title,
        string memory artistName,
        string memory ipfsCID
    ) external returns (uint256) {
        require(bytes(ipfsCID).length > 0, "Invalid IPFS CID");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsCID)));

        artworks[tokenId] = Artwork({
            title: title,
            artistName: artistName,
            ipfsCID: ipfsCID,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        emit ArtworkRegistered(tokenId, title, artistName, ipfsCID, msg.sender);
        return tokenId;
    }

    /**
     * @dev Retrieve artwork details by token ID.
     */
    function getArtworkDetails(uint256 tokenId)
        external
        view
        returns (Artwork memory)
    {
        require(ownerOf(tokenId) != address(0), "Artwork does not exist");
        return artworks[tokenId];
    }
}
