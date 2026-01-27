import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  HeatMapGrid,
} from "recharts";

import {
  getMonthlyStats,
  getOrgStats,
  getStatusStats,
  getTimelineStats,
  getHeatmapStats,
} from "../utils/analytics";

export default function Analytics() {
  const [monthly, setMonthly] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    (async () => {
      setMonthly(await getMonthlyStats());
      setOrgs(await getOrgStats());
      setStatusStats(await getStatusStats());
      setTimeline(await getTimelineStats());
      setHeatmap(await getHeatmapStats());
    })();
  }, []);

  const COLORS = ["#e4d09c", "#b8a76f", "#8a7b52"];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-[#e4d09c]">Analytics Dashboard</h1>

      {/* 📊 Monthly Issuance Line Chart */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl mb-3 text-[#e4d09c]">
          Documents Issued per Month
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly}>
            <CartesianGrid stroke="#2c2a23" />
            <XAxis dataKey="month" stroke="#b8a76f" />
            <YAxis stroke="#b8a76f" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#e4d09c"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Documents Per Organization */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl mb-3 text-[#e4d09c]">
          Documents Issued by Organizations
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orgs}>
            <CartesianGrid stroke="#2c2a23" />
            <XAxis dataKey="org" stroke="#b8a76f" />
            <YAxis stroke="#b8a76f" />
            <Tooltip />
            <Bar dataKey="count" fill="#e4d09c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 Active vs Expired vs Revoked */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl mb-3 text-[#e4d09c]">
          Document Status Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusStats}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={110}
            >
              {statusStats.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 🕒 Timeline View */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl mb-3 text-[#e4d09c]">Issuance Timeline</h2>
        <ul className="space-y-2">
          {timeline.map((event, i) => (
            <li
              key={i}
              className="border-b border-[#2c2a23] pb-2 text-[#b8a76f]"
            >
              📄 Document #{event.tokenId} issued on{" "}
              <span className="text-[#e4d09c]">
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔥 Heatmap (Day × Hour) */}
      <div className="bg-[#1a1813] p-6 rounded-xl border border-[#2c2a23]">
        <h2 className="text-xl mb-3 text-[#e4d09c]">Minting Heatmap</h2>
        <div className="p-4">
          <HeatMapGrid
            data={heatmap}
            xLabels={["0h", "4h", "8h", "12h", "16h", "20h"]}
            yLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            cellRender={(x, y, value) => (
              <div className="text-xs text-[#e4d09c]">{value}</div>
            )}
            cellHeight={40}
            square
            cellStyle={(x, y, value) => ({
              background:
                value === 0
                  ? "#0f0d0a"
                  : value < 3
                  ? "#8a7b52"
                  : value < 5
                  ? "#b8a76f"
                  : "#e4d09c",
              color: "#0f0d0a",
            })}
          />
        </div>
      </div>
    </div>
  );
}
