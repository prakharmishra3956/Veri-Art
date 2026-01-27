import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";
import QRgenerator from "../components/QRgenerator";

export default function VerifyDocument() {
  const [searchParams] = useSearchParams();
  const cidFromQR = searchParams.get("cid");
  const [cid, setCid] = useState(cidFromQR || "");

  const [metadata, setMetadata] = useState(null);
  const [owner, setOwner] = useState(null);
  const [status, setStatus] = useState(null); // valid, invalid, expired, revoked, loading

  const verify = async () => {
    if (!cid) {
      alert("Enter a CID to verify.");
      return;
    }

    try {
      setStatus("loading");

      // 1️⃣ Fetch metadata JSON
      const metadataRes = await fetch(cid);
      if (!metadataRes.ok) {
        setStatus("invalid");
        return;
      }

      const data = await metadataRes.json();
      setMetadata(data);

      // 2️⃣ Verify on blockchain
      const provider = new ethers.BrowserProvider(window.ethereum);
      // TODO: Replace with your deployed contract address
      const CONTRACT_ADDRESS = "0xYourContractAddressHere";

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        provider
      );

      const total = Number(await contract.totalSupply());
      let tokenId = null;
      let foundOwner = null;

      for (let i = 1; i <= total; i++) {
        const tokenURI = await contract.tokenURI(i);
        if (tokenURI === cid) {
          tokenId = i;
          foundOwner = await contract.ownerOf(i);
          break;
        }
      }

      if (!tokenId) {
        setStatus("invalid");
        return;
      }

      setOwner(foundOwner);

      // 3️⃣ Check Expiry (Off-chain metadata expiry)
      if (data.expiry && data.expiry !== "never") {
        const expireDate = new Date(
          Number(data.timestamp) + Number(data.expiry) * 24 * 60 * 60 * 1000
        );

        if (expireDate < new Date()) {
          setStatus("expired");
          return;
        }
      }

      // 4️⃣ Check revocation (On-chain)
      let revoked = false;
      try {
        revoked = await contract.isRevoked(tokenId);
      } catch (_err) {
        // Ignore errors when checking revoked status
      }

      if (data.revoked === true || revoked === true) {
        setStatus("revoked");
        return;
      }

      // 5️⃣ All checks passed → VALID
      setStatus("valid");
    } catch (err) {
      console.error(err);
      setStatus("invalid");
    }
  };

  return (
    <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
      <h1 className="text-3xl font-bold mb-4 text-[#e4d09c]">
        Verify Document
      </h1>

      <p className="text-[#b8a76f] mb-4">
        Enter a metadata CID or use a QR code link to verify authenticity.
      </p>

      {/* Input Field */}
      <input
        type="text"
        className="w-full p-3 mb-3 rounded bg-[#0f0d0a] border border-[#2c2a23]"
        placeholder="Enter IPFS metadata CID"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
      />

      <button
        onClick={verify}
        className="w-full bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg hover:bg-[#d6bc72]"
      >
        Verify Document
      </button>

      {/* Loading */}
      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-[#0f0d0a] p-6 rounded-xl border border-[#2c2a23]"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-[#2a261f] rounded w-1/3"></div>
            <div className="h-4 bg-[#2a261f] rounded w-2/3"></div>
            <div className="h-4 bg-[#2a261f] rounded w-1/2"></div>
            <div className="h-48 bg-[#2a261f] rounded mt-4"></div>
          </div>
        </motion.div>
      )}

      {/* Invalid */}
      {status === "invalid" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 bg-[#1a1813] p-6 rounded-xl border border-red-800 shadow-lg"
        >
          <p className="text-red-500 text-xl font-bold">❌ Invalid Document</p>
          <p className="text-[#b8a76f] mt-2">
            No matching certificate found on the blockchain.
          </p>
        </motion.div>
      )}

      {/* Expired */}
      {status === "expired" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-yellow-900/40 p-6 rounded-xl border border-yellow-700"
        >
          <p className="text-yellow-400 text-xl text-center font-bold">
            ⚠ Document Expired
          </p>

          <p className="text-[#b8a76f] mt-2 text-center">
            This certificate is no longer valid.
          </p>
        </motion.div>
      )}

      {/* Revoked */}
      {status === "revoked" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-red-900/40 p-6 rounded-xl border border-red-700"
        >
          <p className="text-red-400 text-xl font-bold text-center">
            ❌ Document Revoked
          </p>

          <p className="text-[#b8a76f] mt-2 text-center">
            The issuing organization has revoked this certificate.
          </p>
        </motion.div>
      )}

      {/* Valid */}
      {status === "valid" && metadata && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-[#0f0d0a] p-6 rounded-xl border border-[#3a3527]"
        >
          <div className="flex justify-center mb-4">
            <QRgenerator cid={cid} />
          </div>

          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-700 text-white px-4 py-2 rounded-full font-semibold"
            >
              VERIFIED ✔
            </motion.div>
          </div>

          <h2 className="text-2xl font-bold text-[#e4d09c] text-center mb-2">
            Document Verified
          </h2>

          <div className="bg-[#1a1813] p-4 rounded-lg border border-[#2c2a23] mb-4">
            <p className="text-[#e4d09c] text-lg font-semibold">
              {metadata.name}
            </p>
            <p className="text-[#b8a76f] text-sm mt-1">
              {metadata.description}
            </p>
            <p className="text-[#b8a76f] text-sm mt-2">
              <b>Owner:</b> {owner}
            </p>
            <p className="text-[#b8a76f] text-sm">
              <b>Issued:</b>{" "}
              {metadata.timestamp
                ? new Date(Number(metadata.timestamp)).toLocaleString()
                : "N/A"}
            </p>

            {metadata.expiry && metadata.expiry !== "never" && (
              <p className="text-[#b8a76f] text-sm">
                <b>Expiry:</b>{" "}
                {new Date(
                  Number(metadata.timestamp) +
                    Number(metadata.expiry) * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={metadata.file}
              target="_blank"
              className="bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg text-center"
            >
              View Original Document
            </a>

            <a
              href={cid}
              target="_blank"
              className="bg-[#0f0d0a] text-[#e4d09c] py-3 rounded-lg text-center border border-[#2c2a23]"
            >
              View Metadata JSON
            </a>

            <button
              onClick={() => navigator.clipboard.writeText(cid)}
              className="bg-[#1a1813] text-[#e4d09c] py-3 rounded-lg border border-[#2c2a23]"
            >
              Copy Document CID
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
