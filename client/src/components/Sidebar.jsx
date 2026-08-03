import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaPills,
  FaShoppingCart,
  FaTruck,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaBoxes,
} from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Medicines",
      path: "/medicines",
      icon: <FaPills />,
    },
    {
      name: "Purchase",
      path: "/purchase",
      icon: <FaBoxes />,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: <FaShoppingCart />,
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: <FaTruck />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <FaUsers />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-cyan-500 text-white shadow-2xl flex flex-col">
      <div className="p-8 border-b border-white/20">
        <h1 className="text-3xl font-extrabold">💊 MediStock</h1>

        <p className="text-blue-100 mt-2">Pharmacy Management</p>
      </div>

      <nav className="flex-1 p-5 space-y-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <motion.div key={item.path} whileHover={{ x: 8 }}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  active
                    ? "bg-white text-blue-700 shadow-lg font-bold"
                    : "hover:bg-white/20"
                }`}
              >
                <span className="text-xl">{item.icon}</span>

                <span>{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-5">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 rounded-xl py-3 font-semibold transition"
        >
          <FaSignOutAlt />
          Logout
        </Link>

        <p className="text-center text-xs text-blue-100 mt-6">
          MediStock Pro v2.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
