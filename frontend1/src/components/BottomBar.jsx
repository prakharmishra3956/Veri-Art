// import { Upload, CheckCircle, Grid, Settings } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function BottomBar() {
//   const icons = [
//     { icon: Upload, label: "Issue Document", path: "/issue" },
//     { icon: CheckCircle, label: "Verify Document", path: "/verify" },
//     { icon: Grid, label: "Dashboard", path: "/" },
//     { icon: Settings, label: "Organizations", path: "/organizations" },
//   ];

//   return (
//     <div className="mt-auto pt-6">
//       <div className="flex justify-around bg-[#1a1813] rounded-2xl p-3 border border-[#2c2a23]">
//         {icons.map((item, i) => {
//           const Icon = item.icon;
//           return (
//             <Link
//               to={item.path}
//               key={i}
//               className="flex flex-col items-center text-[#b8a76f] hover:text-[#e4d09c] transition"
//             >
//               <Icon size={22} />
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


import { Upload, CheckCircle, Home, Building } from "lucide-react";
import { Link } from "react-router-dom";

export default function BottomBar() {
  const icons = [
    { icon: Upload, label: "Issue Document", path: "/issue" },
    { icon: CheckCircle, label: "Verify Document", path: "/verify" },
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Building, label: "Organizations", path: "/organizations" },
  ];

  return (
    <div className="mt-auto pt-6">
      <div className="flex justify-around bg-[#1a1813] rounded-2xl p-3 border border-[#2c2a23]">
        {icons.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              to={item.path}
              key={i}
              className="flex flex-col items-center text-[#b8a76f] hover:text-[#e4d09c] transition"
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
