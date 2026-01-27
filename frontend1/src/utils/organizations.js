import { ethers } from "ethers";
import contractABI from "./contractABI.json";

const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Connect to contract
function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signerOrProvider);
}

// Fetch all registered organizations
export async function fetchOrganizations() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = getContract(provider);

  const filter = contract.filters.OrganizationAdded();
  const logs = await contract.queryFilter(filter);

  const orgs = logs.map((log) => {
    return {
      address: log.args.org,
      name: log.args.name,
    };
  });

  return orgs;
}

// Add a new organization (ADMIN ONLY)
export async function addOrganization(orgAddress, name) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = getContract(signer);

  const tx = await contract.addOrganization(orgAddress, name);
  await tx.wait();
}

// Remove organization
export async function removeOrganization(orgAddress) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = getContract(signer);

  const tx = await contract.removeOrganization(orgAddress);
  await tx.wait();
}
