import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import BottomBar from "./components/BottomBar.jsx";

import Dashboard from "./components/Dashboard.jsx";
import IssueDocument from "./pages/IssueDocument.jsx";
import VerifyDocument from "./pages/VerifyDocument.jsx";
import Organizations from "./pages/Organizations.jsx";
import DocumentPreview from "./pages/DocumentPreview.jsx";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [account, setAccount] = useState(null);

  const location = useLocation();
  const pathname = location.pathname;
  // const pageName = pathname === "/" ? "Dashboard" : pathname.replace("/", "");
  // console.log(pathname);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask missing");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length) setAccount(accounts[0]);
      });

      window.ethereum.on("accountsChanged", (accounts) =>
        setAccount(accounts[0] || null)
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f0d0a] text-[#e4d09c]">
      {/* LEFT SIDEBAR ALWAYS FIXED */}
      <Sidebar />

      {/* RIGHT MAIN AREA */}
      <div className="flex flex-col flex-1 p-8">
        {/* WALLET BAR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {pathname === "/"
              ? "Dashboard"
              : pathname.replace("/", "").charAt(0).toUpperCase() +
                pathname.slice(2)}
          </h1>

          <button
            onClick={connectWallet}
            className={`px-5 py-2 rounded-lg font-medium ${
              account
                ? "bg-[#1a1813] border border-[#2c2a23] text-[#e4d09c]"
                : "bg-[#e4d09c] text-[#0f0d0a] hover:bg-[#c4ac69]"
            }`}
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>

        {/* ROUTE CONTENT (THIS FIXES YOUR UI!) */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/issue" element={<IssueDocument />} />
            <Route path="/verify" element={<VerifyDocument />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/document/:tokenId" element={<DocumentPreview />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>

        <BottomBar />
      </div>
    </div>
  );
}

export default App;
