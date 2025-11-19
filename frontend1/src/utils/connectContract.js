import { ethers } from "ethers";
import VeriArtABI from "./VeriArtABI.json";

const CONTRACT_ADDRESS = " 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // paste your deployed address

export const getEthereumContract = () => {
  const { ethereum } = window;
  if (!ethereum) {
    alert("Please install MetaMask!");
    return null;
  }

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    VeriArtABI.abi,
    signer
  );
  return contract;
};
