import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";

// contract (same address you used)
const CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// local placeholder logo (you uploaded this file)
const LOCAL_LOGO = "/mnt/data/Screenshot (152).png";

export default function OrgSelector({ selectedOrg, setSelectedOrg }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT, contractABI, provider);

        // Query OrganizationAdded and OrganizationRemoved events
        const added = await contract.queryFilter(
          contract.filters.OrganizationAdded()
        );
        const removed = await contract.queryFilter(
          contract.filters.OrganizationRemoved()
        );

        const removedSet = new Set(
          removed.map((e) => e.args.org.toLowerCase())
        );

        // Build a unique list of currently-active orgs
        const unique = [];
        const seen = new Set();

        for (const ev of added) {
          const addr = ev.args.org;
          const name = ev.args.name;
          const key = addr.toLowerCase();
          if (seen.has(key)) continue;
          if (removedSet.has(key)) continue;
          seen.add(key);
          unique.push({
            address: addr,
            name: name || `${addr.substring(0, 6)}...`,
            logo: LOCAL_LOGO,
          });
        }

        setOrgs(unique);
        // auto-select first org if none selected
        if (!selectedOrg && unique.length) {
          setSelectedOrg(unique[0].address);
        }
      } catch (err) {
        console.error("Failed to load organizations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrgs();
  }, [setSelectedOrg, selectedOrg]);

  return (
    <div className="bg-[#1a1813] p-4 border border-[#2c2a23] rounded-xl mb-6">
      <label className="text-[#b8a76f] text-sm">Select Organization</label>

      {loading ? (
        <div className="mt-3 text-[#b8a76f]">Loading organizations…</div>
      ) : orgs.length === 0 ? (
        <div className="mt-3 text-[#b8a76f]">No organizations found.</div>
      ) : (
        <div className="mt-3">
          <select
            className="w-full p-3 bg-[#0f0d0a] border border-[#2c2a23] rounded text-[#e4d09c]"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            {orgs.map((o) => (
              <option key={o.address} value={o.address}>
                {o.name} — {o.address.substring(0, 6)}...
              </option>
            ))}
          </select>

          {/* small preview */}
          <div className="mt-3 flex items-center gap-3">
            <img
              src={LOCAL_LOGO}
              alt="org logo"
              className="w-10 h-10 rounded border border-[#2c2a23]"
            />
            <div className="text-sm text-[#b8a76f]">
              Selected:{" "}
              <span className="text-[#e4d09c]">
                {selectedOrg ? selectedOrg : "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
