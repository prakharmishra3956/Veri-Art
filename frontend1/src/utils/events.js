import { ethers } from "ethers";
import contractABI from "./contractABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function fetchAllEvents() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  const issuedFilter = contract.filters.DocumentIssued();
  const orgAddFilter = contract.filters.OrganizationAdded();
  const orgRemoveFilter = contract.filters.OrganizationRemoved();

  const issuedLogs = await contract.queryFilter(issuedFilter);
  const orgAddLogs = await contract.queryFilter(orgAddFilter);
  const orgRemoveLogs = await contract.queryFilter(orgRemoveFilter);

  return {
    issued: issuedLogs.map((log) => ({
      org: log.args.org,
      recipient: log.args.recipient,
      tokenId: log.args.tokenId.toString(),
      uri: log.args.uri,
      timestamp: log.blockNumber,
      type: "issued",
    })),
    orgAdded: orgAddLogs.map((log) => ({
      org: log.args.org,
      name: log.args.name,
      timestamp: log.blockNumber,
      type: "orgAdded",
    })),
    orgRemoved: orgRemoveLogs.map((log) => ({
      org: log.args.org,
      timestamp: log.blockNumber,
      type: "orgRemoved",
    })),
  };
}

export function listenToEvents(onEvent) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

  contract.on("DocumentIssued", (org, recipient, tokenId, uri) => {
    onEvent({
      type: "issued",
      org,
      recipient,
      tokenId: tokenId.toString(),
      uri,
      timestamp: Date.now(),
    });
  });

  contract.on("OrganizationAdded", (org, name) => {
    onEvent({
      type: "orgAdded",
      org,
      name,
      timestamp: Date.now(),
    });
  });

  contract.on("OrganizationRemoved", (org) => {
    onEvent({
      type: "orgRemoved",
      org,
      timestamp: Date.now(),
    });
  });
}
