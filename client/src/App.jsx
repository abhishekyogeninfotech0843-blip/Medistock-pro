import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Medicine from "./pages/Medicine";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Medicines */}
        <Route path="/medicines" element={<Medicine />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
