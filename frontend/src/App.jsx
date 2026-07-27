import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

// Components
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

// Pages
import HomePage from './pages/Home/HomePage'
import VerificationPage from './pages/Verify/VerificationPage'
import GuidePage from './pages/Guide/GuidePage'
import IntroductionPage from './pages/Introduction/IntroductionPage'
import LoginPage from './pages/Login/LoginPage'
import CertificateListPage from './pages/CertificateList/CertificateListPage'
import StudentDashboard from './pages/Student/StudentDashboard'
import SchoolDashboard from './pages/school/SchoolDashboard'

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/school') || 
                      location.pathname.startsWith('/student');

  const showFooter = !isDashboard && 
                     location.pathname !== '/' && 
                     location.pathname !== '/certificates';

  return (
    <div className="App">
      {!isDashboard && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/guide/*" element={<GuidePage />} />
          <Route path="/introduction" element={<IntroductionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/certificates" element={<CertificateListPage />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/school/*" element={<SchoolDashboard />} />
          <Route path="/school/dashboard" element={<SchoolDashboard />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
