import React, { useEffect, useState } from "react";
import {
  fetchOrganizations,
  addOrganization,
  removeOrganization,
} from "../utils/organizations";

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [newOrgAddress, setNewOrgAddress] = useState("");
  const [newOrgName, setNewOrgName] = useState("");

  // ✨ Replace with your real admin wallet
  const ADMIN_WALLET =
    import.meta.env.VITE_ADMIN_WALLET ||
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  const [currentWallet, setCurrentWallet] = useState("");

  // Load connected wallet
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((acc) => {
        if (acc.length > 0) setCurrentWallet(acc[0]);
      });
    }
  }, []);

  // Load organizations from blockchain
  const loadOrgs = async () => {
    try {
      const data = await fetchOrganizations();
      setOrgs(data);
    } catch (err) {
      console.error("Failed to load orgs:", err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchOrganizations();
        setOrgs(data);
      } catch (err) {
        console.error("Failed to load orgs:", err);
      }
    })();
  }, []);

  // Add organization handler
  const handleAdd = async () => {
    if (!newOrgAddress || !newOrgName) {
      alert("Enter both wallet address and organization name.");
      return;
    }

    try {
      await addOrganization(newOrgAddress, newOrgName);
      alert("Organization registered!");
      setNewOrgAddress("");
      setNewOrgName("");
      loadOrgs();
    } catch (err) {
      console.error(err);
      alert("Failed to add organization.");
    }
  };

  // Remove organization handler
  const handleRemove = async (address) => {
    try {
      await removeOrganization(address);
      alert("Organization removed.");
      loadOrgs();
    } catch (err) {
      console.error(err);
      alert("Failed to remove organization.");
    }
  };

  return (
    <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
      <h1 className="text-3xl font-bold text-[#e4d09c] mb-6">
        Verified Organizations
      </h1>

      {/* ===================== ADMIN PANEL ===================== */}
      {currentWallet.toLowerCase() === ADMIN_WALLET.toLowerCase() && (
        <div className="mb-6 p-4 rounded-xl bg-[#0f0d0a] border border-[#2c2a23]">
          <h2 className="text-xl font-semibold text-[#e4d09c] mb-3">
            Add Organization (Admin Only)
          </h2>

          <input
            type="text"
            placeholder="Organization Wallet Address"
            value={newOrgAddress}
            onChange={(e) => setNewOrgAddress(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#1a1813] border border-[#2c2a23] text-[#e4d09c]"
          />

          <input
            type="text"
            placeholder="Organization Name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-[#1a1813] border border-[#2c2a23] text-[#e4d09c]"
          />

          <button
            onClick={handleAdd}
            className="w-full bg-[#e4d09c] text-[#0f0d0a] font-semibold py-2 rounded-lg hover:bg-[#d6bc72]"
          >
            Add Organization
          </button>
        </div>
      )}

      {/* ===================== ORGANIZATION LIST ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {orgs.length === 0 ? (
          <p className="text-[#b8a76f] text-center col-span-2">
            No organizations found on-chain.
          </p>
        ) : (
          orgs.map((org, idx) => (
            <div
              key={idx}
              className="bg-[#0f0d0a] p-5 rounded-xl border border-[#2c2a23] flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#e4d09c]">
                  {org.name}
                </h2>
                <p className="text-[#b8a76f] text-sm mt-1">{org.address}</p>
              </div>

              {currentWallet.toLowerCase() === ADMIN_WALLET.toLowerCase() && (
                <button
                  onClick={() => handleRemove(org.address)}
                  className="text-red-500 hover:text-red-300 font-semibold"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
