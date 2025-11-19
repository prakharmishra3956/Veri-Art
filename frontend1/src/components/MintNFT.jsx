// import React, { useState } from "react";
// import {
//   uploadFileToPinata,
//   uploadJSONToPinata,
// } from "../utils/pinataupload.js";
// import contractABI from "../utils/contractABI.json";
// import { ethers } from "ethers";

// const MintNFT = () => {
//   const [name, setName] = useState("");
//   const [desc, setDesc] = useState("");
//   const [file, setFile] = useState(null);
//   const [minting, setMinting] = useState(false);

//   const mintNFT = async () => {
//     if (!name || !desc || !file) {
//       alert("Please fill all fields and upload an image.");
//       return;
//     }

//     try {
//       setMinting(true);

//       // 1️⃣ Upload image to Pinata
//       const imageURI = await uploadFileToPinata(file);

//       // 2️⃣ Create metadata.json
//       const metadata = {
//         name,
//         description: desc,
//         image: imageURI,
//       };

//       // 3️⃣ Upload metadata.json to Pinata
//       const metadataURI = await uploadJSONToPinata(metadata);

//       // 4️⃣ Connect wallet + contract
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       const contract = new ethers.Contract(
//         "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
//         contractABI,
//         signer
//       );

//       // 5️⃣ Mint NFT using your contract’s safeMint function
//       const tx = await contract.safeMint(
//         await signer.getAddress(),
//         metadataURI
//       );
//       await tx.wait();

//       alert("🎉 NFT Minted Successfully!");
//     } catch (error) {
//       console.error("Minting failed:", error);
//       alert("❌ Minting failed! Check console for error.");
//     } finally {
//       setMinting(false);
//     }
//   };

//   return (
//     <div className="bg-[#1a1813] text-[#e4d09c] p-6 rounded-xl border border-[#2c2a23]">
//       <h2 className="text-xl font-bold mb-4">Mint Artwork NFT</h2>

//       <input
//         type="text"
//         placeholder="NFT Name"
//         className="w-full p-3 rounded bg-[#0f0d0a] mb-3 border border-[#2c2a23]"
//         onChange={(e) => setName(e.target.value)}
//       />

//       <textarea
//         placeholder="Description"
//         className="w-full p-3 rounded bg-[#0f0d0a] mb-3 border border-[#2c2a23]"
//         onChange={(e) => setDesc(e.target.value)}
//       />

//       <input
//         type="file"
//         className="mb-4"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <button
//         onClick={mintNFT}
//         disabled={minting}
//         className="bg-[#e4d09c] text-[#0f0d0a] w-full py-2 rounded font-semibold hover:bg-[#d6bc72]"
//       >
//         {minting ? "Minting..." : "Mint NFT"}
//       </button>
//     </div>
//   );
// };

// export default MintNFT;

import React, { useState } from "react";
import { uploadFileToPinata, uploadJSONToPinata } from "../utils/pinataUpload";
import contractABI from "../utils/contractABI.json";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

export default function MintNFT() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [minting, setMinting] = useState(false);

  const [successData, setSuccessData] = useState(null); // NEW: success modal

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const mint = async () => {
    if (!name || !desc || !file) {
      alert("Please fill all fields and upload a file.");
      return;
    }

    try {
      setMinting(true);

      // 1️⃣ Upload File
      const fileCID = await uploadFileToPinata(file);

      // 2️⃣ Metadata
      const metadata = {
        name,
        description: desc,
        file: fileCID,
        timestamp: Date.now(),
      };

      // 3️⃣ Upload metadata.json
      const metadataCID = await uploadJSONToPinata(metadata);

      // 4️⃣ Mint NFT
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        "YOUR_CONTRACT_ADDRESS_HERE",
        contractABI,
        signer
      );

      await (
        await contract.safeMint(await signer.getAddress(), metadataCID)
      ).wait();

      // 🎉 Show success modal
      setSuccessData({
        title: name,
        fileCID,
        metadataCID,
        verifyURL: `${window.location.origin}/verify?cid=${metadataCID}`,
      });
    } catch (err) {
      console.error(err);
      alert("Minting failed.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <>
      {/* ====================== ISSUE DOCUMENT UI ======================= */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl font-semibold mb-4 text-[#e4d09c]">
          Upload & Mint Document
        </h2>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-48 object-cover rounded-lg mb-4 border border-[#2c2a23]"
          />
        )}

        <input
          className="w-full p-3 mb-3 rounded bg-[#0f0d0a] border border-[#2c2a23]"
          placeholder="Document Title"
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-3 rounded bg-[#0f0d0a] border border-[#2c2a23]"
          placeholder="Description"
          onChange={(e) => setDesc(e.target.value)}
        />

        <input
          type="file"
          className="w-full p-3 mb-3 text-[#b8a76f]"
          onChange={handleFile}
        />

        <button
          onClick={mint}
          disabled={minting}
          className="w-full bg-[#e4d09c] text-[#0f0d0a] py-3 rounded-lg hover:bg-[#d6bc72]"
        >
          {minting ? "Minting..." : "Mint Document NFT"}
        </button>
      </div>

      {/* ====================== SUCCESS MODAL ======================= */}
      {successData && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23] w-96 text-center">
            <h2 className="text-2xl font-bold text-[#e4d09c] mb-2">
              🎉 Document Issued!
            </h2>

            <p className="text-[#b8a76f] mb-4">{successData.title}</p>

            {/* QR CODE */}
            <div className="flex justify-center mb-4">
              <QRCodeCanvas value={successData.verifyURL} size={140} />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(successData.verifyURL)
                }
                className="w-full bg-[#e4d09c] text-[#0f0d0a] py-2 rounded-lg hover:bg-[#d6bc72]"
              >
                Copy Verification Link
              </button>

              <a
                href={successData.fileCID}
                target="_blank"
                className="w-full bg-[#0f0d0a] text-[#e4d09c] py-2 rounded-lg border border-[#2c2a23] hover:bg-[#2c2a23]"
              >
                View Document File
              </a>

              <a
                href={successData.metadataCID}
                target="_blank"
                className="w-full bg-[#0f0d0a] text-[#e4d09c] py-2 rounded-lg border border-[#2c2a23] hover:bg-[#2c2a23]"
              >
                View Metadata (IPFS)
              </a>

              <button
                onClick={() => setSuccessData(null)}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
