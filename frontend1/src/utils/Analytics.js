import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Helper: connect to contract (read-only)
 */
async function getContract() {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }
  // ethers v6 uses Web3Provider for MetaMask in browser environment
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []); // request access if needed
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
  return { contract, provider };
}

/**
 * Helper: normalize block timestamp -> JS ms
 */
async function blockTimestampMs(provider, blockNumber) {
  try {
    const blk = await provider.getBlock(blockNumber);
    return blk.timestamp * 1000;
  } catch (e) {
    return Date.now();
  }
}

/* ------------------------------
   Existing analytics functions
   (monthly, orgs, status, timeline, heatmap)
   ------------------------------ */

export async function getMonthlyStats(months = 12) {
  try {
    const { contract, provider } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(),
    );
    const counts = {};

    for (const ev of events) {
      const ts = await blockTimestampMs(provider, ev.blockNumber);
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    const result = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      result.push({ month: key, count: counts[key] || 0 });
    }

    return result;
  } catch (e) {
    console.error("getMonthlyStats error:", e);
    return [];
  }
}

export async function getOrgStats(limit = 50) {
  try {
    const { contract } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(),
    );
    const map = {};

    for (const ev of events) {
      const org = ev.args?.org || ev.args?.[0] || "0x0";
      map[org] = (map[org] || 0) + 1;
    }

    const arr = Object.entries(map)
      .map(([org, count]) => ({ org, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return arr;
  } catch (e) {
    console.error("getOrgStats error:", e);
    return [];
  }
}

export async function getStatusStats() {
  try {
    const { contract } = await getContract();
    const totalBn = await contract.totalSupply();
    const total = Number(totalBn);

    let active = 0;
    let expired = 0;
    let revoked = 0;

    for (let i = 1; i <= total; i++) {
      try {
        const isRevoked = await contract.isRevoked(i);
        if (isRevoked) {
          revoked++;
          continue;
        }

        const expTs = Number(await contract.expiry(i));
        if (expTs > 0) {
          const nowSec = Math.floor(Date.now() / 1000);
          if (nowSec > expTs) {
            expired++;
            continue;
          }
        }
        active++;
      } catch (e) {
        continue;
      }
    }

    return [
      { label: "Active", value: active },
      { label: "Expired", value: expired },
      { label: "Revoked", value: revoked },
    ];
  } catch (e) {
    console.error("getStatusStats error:", e);
    return [];
  }
}

export async function getTimelineStats(limit = 100) {
  try {
    const { contract, provider } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(),
    );

    const mapped = await Promise.all(
      events.map(async (ev) => {
        const tokenId = Number(ev.args?.tokenId || ev.args?.[2]);
        const ts = await blockTimestampMs(provider, ev.blockNumber);
        return {
          tokenId,
          timestamp: ts,
          org: ev.args?.org,
          recipient: ev.args?.recipient,
        };
      }),
    );

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    return mapped.slice(0, limit);
  } catch (e) {
    console.error("getTimelineStats error:", e);
    return [];
  }
}

export async function getHeatmapStats() {
  try {
    const { contract, provider } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(),
    );

    const rows = 7;
    const cols = 6;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (const ev of events) {
      const tsMs = await blockTimestampMs(provider, ev.blockNumber);
      const d = new Date(tsMs);
      const jsDay = d.getDay();
      const row = (jsDay + 6) % 7;
      const hour = d.getHours();
      const bucket = Math.min(Math.floor(hour / 4), cols - 1);
      grid[row][bucket] = (grid[row][bucket] || 0) + 1;
    }

    return grid;
  } catch (e) {
    console.error("getHeatmapStats error:", e);
    return [];
  }
}

/* ------------------------------
   NEW: Organization-specific helpers
   ------------------------------ */

/**
 * getOrgDocuments(orgAddress)
 * Returns counts for organization: { total, active, expired, revoked }
 */
export async function getOrgDocuments(orgAddress) {
  try {
    const { contract, provider } = await getContract();

    // Query only DocumentIssued events for this org
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(orgAddress),
    );

    let active = 0;
    let expired = 0;
    let revokedCount = 0;

    const nowSec = Math.floor(Date.now() / 1000);

    for (const ev of events) {
      const tokenId = Number(ev.args?.tokenId || ev.args?.[2]);
      try {
        const isRev = await contract.isRevoked(tokenId);
        if (isRev) {
          revokedCount++;
          continue;
        }

        const exp = Number(await contract.expiry(tokenId));
        if (exp > 0 && nowSec > exp) {
          expired++;
          continue;
        }

        active++;
      } catch (err) {
        // ignore
        continue;
      }
    }

    return {
      total: events.length,
      active,
      expired,
      revoked: revokedCount,
    };
  } catch (e) {
    console.error("getOrgDocuments error:", e);
    return {
      total: 0,
      active: 0,
      expired: 0,
      revoked: 0,
    };
  }
}

/**
 * getOrgEvents(org)
 * Returns a sorted array of events for a given organization
 */
export async function getOrgEvents(org) {
  try {
    const { contract, provider } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(org),
    );

    const mapped = await Promise.all(
      events.map(async (ev) => {
        const tokenId = Number(ev.args?.tokenId || ev.args?.[2]);
        const ts = await blockTimestampMs(provider, ev.blockNumber);
        return {
          type: "issued",
          tokenId,
          recipient: ev.args?.recipient,
          timestamp: ts,
          org: ev.args?.org,
        };
      }),
    );

    mapped.sort((a, b) => b.timestamp - a.timestamp);
    return mapped;
  } catch (e) {
    console.error("getOrgEvents error:", e);
    return [];
  }
}

/**
 * getTotalDocuments()
 * Returns the total number of documents issued (total supply)
 */
export async function getTotalDocuments() {
  try {
    const { contract } = await getContract();
    const totalBn = await contract.totalSupply();
    return Number(totalBn);
  } catch (e) {
    console.error("getTotalDocuments error:", e);
    return 0;
  }
}

/**
 * getTotalOrganizations()
 * Returns the total number of unique organizations that have issued documents
 */
export async function getTotalOrganizations() {
  try {
    const { contract } = await getContract();
    const events = await contract.queryFilter(
      contract.filters.DocumentIssued(),
    );
    const orgs = new Set();

    for (const ev of events) {
      const org = ev.args?.org || ev.args?.[0] || "0x0";
      orgs.add(org);
    }

    return orgs.size;
  } catch (e) {
    console.error("getTotalOrganizations error:", e);
    return 0;
  }
}
