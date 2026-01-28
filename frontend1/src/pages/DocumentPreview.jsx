import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../utils/contractABI.json";
import QrGenerator from "../components/QrGenerator";
import { motion } from "framer-motion";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

/* ----------------- EXPIRY HELPERS ------------------- */

function getExpiryDate(issuedAt, expiryCode) {
  if (!issuedAt || expiryCode === "never") return "Never";

  const date = new Date(issuedAt);

  switch (expiryCode) {
    case "1m":
      date.setMonth(date.getMonth() + 1);
      break;
    case "6m":
      date.setMonth(date.getMonth() + 6);
      break;
    case "1y":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "5y":
      date.setFullYear(date.getFullYear() + 5);
      break;
    default:
      return "Never";
  }

  return date.toISOString();
}

function isExpired(expiryDate) {
  if (expiryDate === "Never") return false;
  return new Date(expiryDate) < new Date();
}

/* ----------------------------------------------------- */

export default function DocumentPreview() {
  const { tokenId } = useParams();

  const [metadata, setMetadata] = useState(null);
  const [owner, setOwner] = useState(null);
  const [issuer, setIssuer] = useState(null);
  const [cid, setCid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          provider
        );

        // Fetch tokenURI
        const tokenURI = await contract.tokenURI(tokenId);
        setCid(tokenURI);

        // Fetch metadata JSON
        const metaRes = await fetch(tokenURI);
        const meta = await metaRes.json();
        setMetadata(meta);

        // Load owner
        const own = await contract.ownerOf(tokenId);
        setOwner(own);

        // Load issuer from events
        const filter = contract.filters.DocumentIssued(null, tokenId);
        const logs = await contract.queryFilter(filter);
        const issuerAddress = logs[0]?.args?.org;
        setIssuer(issuerAddress);
      } catch (err) {
        console.error("Error loading document:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [tokenId]);

  if (loading)
    return <p className="text-[#b8a76f] text-lg">Loading document…</p>;

  /* ---- Calculate expiry ---- */
  const expiryDate = getExpiryDate(metadata?.timestamp, metadata?.expiry);
  const expired = isExpired(expiryDate);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#e4d09c]">
          Document #{tokenId}
        </h1>

        {!expired ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-700 text-white px-4 py-2 rounded-full font-semibold"
          >
            VERIFIED ✔
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-700 text-white px-4 py-2 rounded-full font-semibold"
          >
            EXPIRED ✖
          </motion.div>
        )}
      </div>

      {/* META INFO */}
      <div className="bg-[#0f0d0a] p-5 rounded-xl border border-[#2c2a23]">
        <h2 className="text-2xl font-semibold text-[#e4d09c] mb-2">
          {metadata?.name}
        </h2>

        <p className="text-[#b8a76f] mb-3">{metadata?.description}</p>

        <div className="text-sm text-[#b8a76f] space-y-2">
          <p>
            <b>Issuer:</b> <span className="text-[#e4d09c]">{issuer}</span>
          </p>

          <p>
            <b>Owner:</b> <span className="text-[#e4d09c]">{owner}</span>
          </p>

          {/* Issued Timestamp */}
          <p>
            <b>Issued At:</b>{" "}
            {metadata?.timestamp
              ? new Date(metadata.timestamp).toLocaleString()
              : "N/A"}
          </p>

          {/* Expiry */}
          <p>
            <b>Expiry:</b>{" "}
            <span
              className={expired ? "text-red-400 font-bold" : "text-[#e4d09c]"}
            >
              {expiryDate === "Never"
                ? "Never (Permanent)"
                : new Date(expiryDate).toLocaleString()}
            </span>
          </p>

          {/* Status */}
          <p>
            <b>Status:</b>{" "}
            {!expired ? (
              <span className="text-green-500 font-bold">Active ✔</span>
            ) : (
              <span className="text-red-500 font-bold">Expired ✖</span>
            )}
          </p>

          {/* Metadata CID */}
          <p>
            <b>Metadata CID:</b>{" "}
            <a href={cid} target="_blank" className="text-blue-400 underline">
              {cid}
            </a>
          </p>
        </div>
      </div>

      {/* DOCUMENT VIEW */}
      <div className="mt-6 bg-[#0f0d0a] p-4 rounded-xl border border-[#2c2a23]">
        <h3 className="text-xl font-bold text-[#e4d09c] mb-2">
          Original Document
        </h3>

        <a
          href={metadata?.file}
          target="_blank"
          className="block bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg text-center hover:bg-[#d6bc72]"
        >
          View / Download Document
        </a>
      </div>

      {/* QR CODE */}
      <div className="mt-6 bg-[#0f0d0a] p-4 rounded-xl border border-[#2c2a23]">
        <h3 className="text-xl font-bold text-[#e4d09c] mb-3">
          Verification QR Code
        </h3>
        <QrGenerator cid={cid} />
      </div>

      {/* RAW METADATA */}
      <div className="mt-4">
        <a
          href={cid}
          target="_blank"
          className="block bg-[#1a1813] text-[#e4d09c] py-3 rounded-lg text-center border border-[#2c2a23] hover:bg-[#2c2a23]"
        >
          View Raw Metadata JSON
        </a>
      </div>
    </motion.div>
  );
}
