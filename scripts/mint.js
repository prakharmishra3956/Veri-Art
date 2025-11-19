import { network } from "hardhat";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const TOKEN_URI =
  "https://gateway.pinata.cloud/ipfs/QmbpdtpGuDk5Xn7L2XaeF1C3gmqBXq6N8AUK8t7WnGi6t2"; // your artwork CID

async function main() {
  const { viem } = await network.connect();
  const veriArt = await viem.getContractAt("VeriArt", CONTRACT_ADDRESS);

  const [owner] = await viem.getWalletClients();
  const hash = await veriArt.write.registerArtwork([
    "Sample Artwork",
    "Artist Name",
    "QmYD63WTN34sWgGsbRw1akWJrKLWw9wwo4YDUwy32JiqQB",
  ]);
  console.log("Transaction hash:", hash);

  console.log("✅ Artwork registered successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
