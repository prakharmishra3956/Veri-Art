import { ethers } from "ethers";
import contractABI from "./contractABI.json";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export async function fetchIssuedDocuments(orgAddress) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  const filter = contract.filters.DocumentIssued(orgAddress);
  const logs = await contract.queryFilter(filter);

  // Parse event logs
  return logs.map((log) => ({
    org: log.args.org,
    tokenId: Number(log.args.tokenId),
    uri: log.args.uri,
  }));
}
