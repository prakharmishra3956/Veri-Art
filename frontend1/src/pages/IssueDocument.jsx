import React, { useState } from "react";
import { ethers } from "ethers";
import { uploadJSONToPinata, uploadFileToPinata } from "../utils/pinataUpload";
import contractABI from "../utils/contractABI.json";
import QrGenerator from "../components/QrGenerator";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

export default function IssueDocument() {
  const [documentName, setDocumentName] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState("never");

  const [loading, setLoading] = useState(false);
  const [mintedCID, setMintedCID] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  /** ------------------------------
   *  STEP 1 — Upload file → Pinata
   * ------------------------------ */
  const uploadDocumentFile = async () => {
    const uploaded = await uploadFileToPinata(file);
    if (!uploaded?.IpfsHash) throw new Error("File upload failed");
    return `https://gateway.pinata.cloud/ipfs/${uploaded.IpfsHash}`;
  };

  /** ------------------------------------
   *  STEP 2 — Build Metadata + Upload JSON
   * ------------------------------------ */
  const uploadMetadata = async (fileCID, issuer) => {
    const metadata = {
      name: documentName,
      description: description,
      file: fileCID,
      timestamp: new Date().toISOString(),
      issuer: issuer,
      expiry: expiry,
      attributes: [
        { trait_type: "Document Type", value: docType },
        { trait_type: "Issued By", value: issuer },
        { trait_type: "Expiry", value: expiry },
        { trait_type: "Verified", value: true },
      ],
    };

    const uploadedJSON = await uploadJSONToPinata(metadata);

    if (!uploadedJSON?.IpfsHash) throw new Error("Metadata JSON upload failed");

    return `https://gateway.pinata.cloud/ipfs/${uploadedJSON.IpfsHash}`;
  };

  /** ------------------------------
   *   STEP 3 — Mint NFT on-chain
   * ------------------------------ */
  const mintDocument = async (metadataCID) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    const tx = await contract.safeMint(await signer.getAddress(), metadataCID);
    const receipt = await tx.wait();

    // Extract tokenId from event logs
    const event = receipt.logs.find((log) => log.fragment?.name === "Transfer");

    const mintedId = event ? Number(event.args.tokenId) : null;
    setTokenId(mintedId);

    return mintedId;
  };

  /** ------------------------------
   *   MASTER FUNCTION — ISSUE DOC
   * ------------------------------ */
  const issue = async () => {
    if (!documentName || !description || !docType || !file) {
      alert("Please fill all fields and upload a document.");
      return;
    }

    try {
      setLoading(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const issuer = accounts[0];

      // 1️⃣ Upload file
      const documentCID = await uploadDocumentFile();

      // 2️⃣ Upload metadata JSON
      const metadataCID = await uploadMetadata(documentCID, issuer);

      // 3️⃣ Mint NFT
      await mintDocument(metadataCID);

      // 4️⃣ Show QR
      setMintedCID(metadataCID);

      alert("Document Issued Successfully!");
    } catch (err) {
      console.error(err);
      alert("Error issuing document");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23] max-w-2xl">
      <h1 className="text-3xl font-bold text-[#e4d09c] mb-6">Issue Document</h1>

      {/* Document Name */}
      <input
        type="text"
        className="w-full mb-3 p-3 rounded bg-[#0f0d0a] border border-[#2c2a23] text-[#e4d09c]"
        placeholder="Document Title"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
      />

      {/* Description */}
      <textarea
        className="w-full mb-3 p-3 rounded bg-[#0f0d0a] border border-[#2c2a23] text-[#e4d09c]"
        placeholder="Description"
        rows="3"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      {/* Document Type */}
      <input
        type="text"
        className="w-full mb-3 p-3 rounded bg-[#0f0d0a] border border-[#2c2a23] text-[#e4d09c]"
        placeholder="Document Type (Degree, Art, Certificate...)"
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
      />

      {/* File Upload */}
      <input
        type="file"
        className="w-full mb-3 p-3 rounded bg-[#1a1813] text-[#e4d09c] border border-[#2c2a23]"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Expiry Selector */}
      <select
        className="w-full mb-4 p-3 rounded bg-[#1a1813] border border-[#2c2a23] text-[#e4d09c]"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      >
        <option value="never">No Expiry (Permanent)</option>
        <option value="1m">Expires in 1 Month</option>
        <option value="6m">Expires in 6 Months</option>
        <option value="1y">Expires in 1 Year</option>
        <option value="5y">Expires in 5 Years</option>
      </select>

      {/* Issue Button */}
      <button
        onClick={issue}
        className="w-full bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg font-semibold hover:bg-[#d6bc72] transition"
        disabled={loading}
      >
        {loading ? "Issuing..." : "Issue Document"}
      </button>

      {/* Show QR After Mint */}
      {mintedCID && (
        <div className="mt-6 bg-[#0f0d0a] p-4 rounded-xl border border-[#2c2a23]">
          <h2 className="text-xl font-semibold text-[#e4d09c] mb-3">
            Document Issued Successfully
          </h2>

          <p className="text-[#b8a76f] mb-3">
            Token ID:{" "}
            <span className="text-[#e4d09c] font-semibold">{tokenId}</span>
          </p>

          <QrGenerator cid={mintedCID} />
        </div>
      )}
    </div>
  );
}
