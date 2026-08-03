import Sidebar from "../components/Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";

const AppLayout = ({ children }) => {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        {/* Top Navbar */}

        <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
          {/* Search */}

          <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 w-[420px]">
            <FaSearch className="text-slate-400" />

            <input
              placeholder="Search medicines..."
              className="bg-transparent outline-none ml-3 w-full"
            />
          </div>

          {/* Right */}

          <div className="flex items-center gap-6">
            <button className="relative">
              <FaBell className="text-2xl text-slate-600" />

              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/100"
                className="w-12 h-12 rounded-full"
              />

              <div>
                <h3 className="font-bold">Admin</h3>

                <p className="text-sm text-slate-500">Pharmacy Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page */}

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
