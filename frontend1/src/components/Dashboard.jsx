import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OrgSelector from "../components/OrgSelector";
import {
  getTotalDocuments,
  getTotalOrganizations,
  getStatusStats,
  getOrgDocuments,
  getOrgEvents,
} from "../utils/Analytics";

export default function Dashboard() {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [revokedCount, setRevokedCount] = useState(0);

  // org-specific
  const [orgStats, setOrgStats] = useState(null);
  const [orgActivity, setOrgActivity] = useState([]);
  const [activity, setActivity] = useState([]); // fallback global activity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlobal = async () => {
      try {
        if (!window.ethereum) {
          setLoading(false);
          return;
        }

        // Global stats
        const [docs, orgs, statusStats, timelineStats] = await Promise.all([
          getTotalDocuments(),
          getTotalOrganizations(),
          getStatusStats(),
          getTimelineStats(20),
        ]);

        setTotalDocs(docs);
        setTotalOrgs(orgs);

        // statusStats shape: [{label:"Active", value}, ...]
        const expiredObj = statusStats.find((s) => s.label === "Expired");
        const revokedObj = statusStats.find((s) => s.label === "Revoked");
        setExpiredCount(expiredObj ? expiredObj.value : 0);
        setRevokedCount(revokedObj ? revokedObj.value : 0);

        // fallback activity using timelineStats
        setActivity(timelineStats);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
      setLoading(false);
    };

    loadGlobal();
  }, []);

  // load organization-specific stats when selection changes
  useEffect(() => {
    if (!selectedOrg) return;

    (async () => {
      try {
        const stats = await getOrgDocuments(selectedOrg);
        setOrgStats(stats);

        const events = await getOrgEvents(selectedOrg);
        setOrgActivity(events.slice(0, 10));
      } catch (err) {
        console.error("Failed to load org data:", err);
      }
    })();
  }, [selectedOrg]);

  if (loading) {
    return (
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <p className="text-[#b8a76f] text-lg">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization selector */}
      <OrgSelector selectedOrg={selectedOrg} setSelectedOrg={setSelectedOrg} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
        >
          <h2 className="text-xl font-bold text-[#e4d09c]">Total Documents</h2>
          <p className="text-4xl font-bold text-[#e4d09c]">{totalDocs}</p>
          <p className="text-[#b8a76f] text-sm mt-2">
            Documents issued on-chain
          </p>
        </motion.div>

        {/* Organizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
        >
          <h2 className="text-xl font-bold text-[#e4d09c]">Organizations</h2>
          <p className="text-4xl font-bold text-[#e4d09c]">{totalOrgs}</p>
          <p className="text-[#b8a76f] text-sm mt-2">
            Registered Organizations
          </p>
        </motion.div>

        {/* Expired */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
        >
          <h2 className="text-xl font-bold text-[#e4d09c]">Expired</h2>
          <p className="text-4xl font-bold text-yellow-400">{expiredCount}</p>
          <p className="text-[#b8a76f] text-sm mt-2">Expired certificates</p>
        </motion.div>

        {/* Revoked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
        >
          <h2 className="text-xl font-bold text-[#e4d09c]">Revoked</h2>
          <p className="text-4xl font-bold text-red-500">{revokedCount}</p>
          <p className="text-[#b8a76f] text-sm mt-2">Revoked certificates</p>
        </motion.div>
      </div>

      {/* Organization summary (if selected) */}
      {selectedOrg && (
        <div className="bg-[#1a1813] p-4 rounded-xl border border-[#2c2a23]">
          <h3 className="text-xl font-bold text-[#e4d09c]">
            Organization Overview
          </h3>
          <p className="text-[#b8a76f] mt-2">
            <b>Address:</b>{" "}
            <span className="text-[#e4d09c]">{selectedOrg}</span>
          </p>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="p-3 bg-[#0f0d0a] rounded border border-[#2c2a23]">
              <div className="text-sm text-[#b8a76f]">Total</div>
              <div className="text-2xl text-[#e4d09c]">
                {orgStats?.total ?? 0}
              </div>
            </div>
            <div className="p-3 bg-[#0f0d0a] rounded border border-[#2c2a23]">
              <div className="text-sm text-[#b8a76f]">Active</div>
              <div className="text-2xl text-[#e4d09c]">
                {orgStats?.active ?? 0}
              </div>
            </div>
            <div className="p-3 bg-[#0f0d0a] rounded border border-[#2c2a23]">
              <div className="text-sm text-[#b8a76f]">Expired</div>
              <div className="text-2xl text-yellow-400">
                {orgStats?.expired ?? 0}
              </div>
            </div>
            <div className="p-3 bg-[#0f0d0a] rounded border border-[#2c2a23]">
              <div className="text-sm text-[#b8a76f]">Revoked</div>
              <div className="text-2xl text-red-500">
                {orgStats?.revoked ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity feed (org-specific if org selected) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]"
      >
        <h2 className="text-2xl font-bold text-[#e4d09c] mb-4">
          Recent Activity {selectedOrg ? "(Organization)" : ""}
        </h2>

        {selectedOrg ? (
          orgActivity.length === 0 ? (
            <p className="text-[#b8a76f]">No activity for this organization.</p>
          ) : (
            <ul className="space-y-3">
              {orgActivity.map((evt, i) => (
                <li
                  key={i}
                  className="text-sm text-[#b8a76f] border-b border-[#2c2a23] pb-2"
                >
                  📄 Document #{evt.tokenId} issued to{" "}
                  <span className="text-[#e4d09c]">{evt.recipient}</span>{" "}
                  <span className="text-xs text-[#b8a76f]">
                    {" "}
                    — {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )
        ) : activity.length === 0 ? (
          <p className="text-[#b8a76f]">No activity found.</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((evt, i) => (
              <li
                key={i}
                className="text-sm text-[#b8a76f] border-b border-[#2c2a23] pb-2"
              >
                📄 Document #{evt.tokenId} issued to{" "}
                <span className="text-[#e4d09c]">{evt.recipient}</span>{" "}
                <span className="text-xs text-[#b8a76f]">
                  {" "}
                  — {new Date(evt.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
