import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("VeriArt", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should deploy VeriArt contract", async function () {
    const veriArt = await viem.deployContract("VeriArt");

    // Basic check: contract should have an address
    assert.ok(veriArt.address);
  });

  it("Should register an artwork", async function () {
    const veriArt = await viem.deployContract("VeriArt");

    const title = "Test Artwork";
    const artistName = "Test Artist";
    const ipfsCID = "QmTestCID";

    const hash = await veriArt.write.registerArtwork([
      title,
      artistName,
      ipfsCID,
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Assuming the event is emitted, get the tokenId from logs or assume 0 for first
    const tokenId = 0n; // For simplicity, since it's the first

    // Check that the artwork was registered
    const artwork = await veriArt.read.getArtworkDetails([tokenId]);
    assert.equal(artwork.title, title);
    assert.equal(artwork.artistName, artistName);
    assert.equal(artwork.ipfsCID, ipfsCID);
  });
});
