export default function Dashboard() {
  const stats = [
    { label: "Total Documents", value: "148" },
    { label: "Pending Verifications", value: "6" },
    { label: "Organizations", value: "24" },
  ];

  const recent = [
    { activity: "Degree certificate verified", time: "2 hours ago" },
    { activity: "Transcript issued to Jane Smith", time: "1 day ago" },
    { activity: "Employment letter issued to David", time: "2 days ago" },
    { activity: "Vaccination record verified", time: "3 days ago" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#1a1813] rounded-xl p-6 shadow-lg border border-[#2c2a23]"
          >
            <h3 className="text-sm text-[#b8a76f] mb-2">{stat.label}</h3>
            <p className="text-4xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1813] rounded-xl p-6 border border-[#2c2a23]">
        <h2 className="text-lg mb-4 font-semibold">Recent Activity</h2>
        <ul className="space-y-2">
          {recent.map((item, i) => (
            <li
              key={i}
              className="flex justify-between text-sm border-b border-[#2c2a23] pb-2"
            >
              <span>{item.activity}</span>
              <span className="text-[#b8a76f]">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
