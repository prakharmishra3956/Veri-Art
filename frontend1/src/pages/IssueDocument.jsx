import MintNFT from "../components/MintNFT";

export default function IssueDocument() {
  return (
    <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
      <h1 className="text-3xl font-bold mb-4 text-[#e4d09c]">Issue Document</h1>
      <p className="text-[#b8a76f] mb-6">
        Upload a document and mint a blockchain-verified certificate.
      </p>

      <MintNFT />
    </div>
  );
}
