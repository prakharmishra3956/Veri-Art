import hre from "hardhat";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

async function main() {
  console.log("🚀 Deploying VeriArtNFT...");

  // Create provider for localhost
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  
  // Get the first account address (Hardhat's default account)
  const accounts = await provider.listAccounts();
  const signer = accounts.length > 0 
    ? await provider.getSigner(accounts[0].address)
    : Wallet.createRandom().connect(provider);
  
  // Get the contract artifact
  const VeriArtArtifact = await hre.artifacts.readArtifact("VeriArtNFT");
  
  // Create contract factory using ethers
  const VeriArt = new ContractFactory(
    VeriArtArtifact.abi,
    VeriArtArtifact.bytecode,
    signer
  );
  
  const veriArt = await VeriArt.deploy();

  await veriArt.waitForDeployment();

  const address = await veriArt.getAddress();
  console.log("✅ VeriArtNFT deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
