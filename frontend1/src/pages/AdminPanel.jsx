import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function AdminPanel() {
  const [isOwner, setIsOwner] = useState(false);
  const [orgAddress, setOrgAddress] = useState("");
  const [orgName, setOrgName] = useState("");

  const [orgList, setOrgList] = useState([]);

  // Load all org records by checking events
  const loadOrganizations = async (contract) => {
    try {
      const filter = contract.filters.OrganizationAdded();
      const logs = await contract.queryFilter(filter);

      const orgs = logs.map((log) => ({
        address: log.args.org,
        name: log.args.name,
      }));

      setOrgList(orgs);
    } catch (err) {
      console.error(err);
    }
  };

  // Get current wallet + check if owner
  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const owner = await contract.owner();
      const user = await signer.getAddress();

      setIsOwner(owner.toLowerCase() === user.toLowerCase());

      loadOrganizations(contract);
    })();
  }, []);

  const addOrganization = async () => {
    if (!orgAddress || !orgName) {
      alert("Enter both organization address & name.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.addOrganization(orgAddress, orgName);
      await tx.wait();

      alert("Organization added!");
      setOrgList([...orgList, { address: orgAddress, name: orgName }]);
    } catch (err) {
      console.error(err);
      alert("Error adding organization.");
    }
  };

  const removeOrganization = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.removeOrganization(address);
      await tx.wait();

      alert("Organization removed!");
      setOrgList(orgList.filter((org) => org.address !== address));
    } catch (err) {
      console.error(err);
      alert("Error removing organization.");
    }
  };

  if (!isOwner)
    return (
      <p className="text-[#e4d09c] text-lg">
        Only the contract owner can access the admin panel.
      </p>
    );

  return (
    <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
      <h1 className="text-3xl font-bold text-[#e4d09c] mb-6">
        Admin Panel — Manage Organizations
      </h1>

      {/* Add Org */}
      <div className="bg-[#0f0d0a] p-4 rounded-xl border border-[#2c2a23] mb-6">
        <h2 className="text-xl font-semibold text-[#e4d09c] mb-3">
          Add Organization
        </h2>

        <input
          type="text"
          placeholder="Org Wallet Address"
          className="w-full p-3 mb-3 rounded bg-[#1a1813] border border-[#2c2a23]"
          onChange={(e) => setOrgAddress(e.target.value)}
        />

        <input
          type="text"
          placeholder="Organization Name"
          className="w-full p-3 mb-3 rounded bg-[#1a1813] border border-[#2c2a23]"
          onChange={(e) => setOrgName(e.target.value)}
        />

        <button
          onClick={addOrganization}
          className="w-full bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg hover:bg-[#d6bc72]"
        >
          Add Organization
        </button>
      </div>

      {/* Organization List */}
      <h2 className="text-2xl font-semibold text-[#e4d09c] mb-4">
        Verified Organizations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orgList.map((org, idx) => (
          <div
            key={idx}
            className="bg-[#0f0d0a] p-4 rounded-xl border border-[#2c2a23]"
          >
            <h3 className="text-lg text-[#e4d09c]">{org.name}</h3>
            <p className="text-[#b8a76f] text-sm">{org.address}</p>

            <button
              onClick={() => removeOrganization(org.address)}
              className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
