const DashboardHeader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            color: "#1e3a8a",
          }}
        >
          🏥 MediStock Pro
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          Welcome Back 👋
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search medicines..."
        style={{
          width: "300px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          outline: "none",
          fontSize: "15px",
        }}
      />
    </div>
  );
};

export default DashboardHeader;
