import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Issue Document", path: "/issue" },
    { name: "Verify Document", path: "/verify" },
    { name: "Organizations", path: "/organizations" },
    { label: "Admin Panel", path: "/admin" },
  ];

  return (
    <div className="w-64 p-6 border-r border-[#1a1813] flex flex-col justify-between">
      <div>
        <h1 className="text-5xl font-bold mb-8">
          VeriCart<span className="text-xs align-top ml-1">®</span>
        </h1>

        <nav className="flex flex-col gap-4">
          {links.map((item, i) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={i}
                to={item.path}
                className={`text-left px-4 py-2 rounded-lg transition-all block ${
                  isActive
                    ? "bg-[#1a1813] text-[#e4d09c] font-semibold"
                    : "hover:bg-[#1a1813] hover:text-[#e4d09c]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
