import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const veriArt = await viem.deployContract("VeriArt");

  console.log(`✅ VeriArt deployed to: ${veriArt.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
