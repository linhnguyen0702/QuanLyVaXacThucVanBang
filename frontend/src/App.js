import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import VerificationPage from "./pages/VerificationPage";
import GuidePage from "./pages/GuidePage";
import IntroductionPage from "./pages/IntroductionPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import "./App.css";

function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/guide/*" element={<GuidePage />} />
          <Route path="/introduction" element={<IntroductionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/school/dashboard" element={<SchoolDashboard />} />
        </Routes>
      </main>
      {!isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
