const DashboardCard = ({ title, value, color, icon }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        borderTop: `5px solid ${color}`,
        transition: "0.3s",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: "42px" }}>{icon}</div>

      <h3 style={{ color: "#666", marginTop: "10px" }}>{title}</h3>

      <h1 style={{ color: color, marginTop: "8px" }}>{value}</h1>
    </div>
  );
};

export default DashboardCard;
