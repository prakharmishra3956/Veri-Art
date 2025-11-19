import { ethers } from "ethers";
import VeriArtABI from "../artifacts/contracts/VeriArtNFT.sol/VeriArtNFT.json";

const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

export const getContract = async () => {
  if (!window.ethereum) {
    alert("MetaMask not detected!");
    return null;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    VeriArtABI.abi,
    signer
  );
  return contract;
};
