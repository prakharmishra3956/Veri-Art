import { ethers } from "ethers";
import contractABI from "./contractABI.json";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

function getContract(providerOrSigner) {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, providerOrSigner);
}

// 🔹 1. Total documents issued
export async function getTotalDocuments() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);

  const total = await contract.totalSupply();
  return Number(total);
}

// 🔹 2. Organization count from logs
export async function getTotalOrganizations() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);

  const logs = await contract.queryFilter(contract.filters.OrganizationAdded());
  return logs.length;
}

// 🔹 3. Recent 5 documents
export async function getRecentDocuments() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);

  const logs = await contract.queryFilter(contract.filters.DocumentIssued());

  const recent = logs.slice(-5).reverse();

  return Promise.all(
    recent.map(async (log) => {
      const metadataRes = await fetch(log.args.tokenURI);
      const metadata = await metadataRes.json();

      return {
        org: log.args.org,
        tokenId: Number(log.args.tokenId),
        metadata,
      };
    })
  );
}
