import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import LoanPage from "./pages/LoanPage";
import InvestmentPage from "./pages/InvestmentPage";
import WithdrawalPage from "./pages/WithdrawalPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home token={token} />} />
        <Route path="/login" element={<Login onLogin={(t) => setToken(t)} />} />
        <Route
          path="/signup"
          element={<Signup onLogin={(t) => setToken(t)} />}
        />
        {token && (
          <>
            <Route path="/dashboard" element={<Dashboard token={token} />} />
            <Route path="/loan" element={<LoanPage token={token} />} />
            <Route
              path="/investment"
              element={<InvestmentPage token={token} />}
            />
            <Route
              path="/withdraw"
              element={<WithdrawalPage token={token} />}
            />
            <Route path="/profile" element={<ProfilePage token={token} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
