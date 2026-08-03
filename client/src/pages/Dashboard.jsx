import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import DashboardHeader from "../components/DashboardHeader";
import { getDashboardData } from "../services/dashboardService";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardData();
      console.log(data);
      setStats(data);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f4f7fe",
          minHeight: "100vh",
        }}
      >
        <DashboardHeader />

        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{
              margin: 0,
              color: "#1e293b",
            }}
          >
            Welcome, {user?.name} 👋
          </h2>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            {user?.email}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
          }}
        >
          <DashboardCard
            title="Medicines"
            value={stats?.totalMedicines || 0}
            color="#2563eb"
            icon="💊"
          />

          <DashboardCard
            title="Suppliers"
            value={stats?.totalSuppliers || 0}
            color="#16a34a"
            icon="🚚"
          />

          <DashboardCard
            title="Customers"
            value={stats?.totalCustomers || 0}
            color="#ea580c"
            icon="🧑‍🤝‍🧑"
          />

          <DashboardCard
            title="Sales"
            value={`₹${stats?.totalSales || 0}`}
            color="#9333ea"
            icon="💰"
          />

          <DashboardCard
            title="Purchases"
            value={`₹${stats?.totalPurchases || 0}`}
            color="#0f766e"
            icon="🛒"
          />

          <DashboardCard
            title="Low Stock"
            value={stats?.lowStock || 0}
            color="#dc2626"
            icon="⚠️"
          />

          <DashboardCard
            title="Expired"
            value={stats?.expiredMedicines || 0}
            color="#ef4444"
            icon="🚨"
          />

          <DashboardCard
            title="Notifications"
            value={stats?.notifications || 0}
            color="#f59e0b"
            icon="🔔"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
