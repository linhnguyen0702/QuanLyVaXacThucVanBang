import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Pages
import HomePage from './pages/HomePage'
import VerifyPage from './pages/VerifyPage'
import GuidePage from './pages/GuidePage'
import LoginPage from './pages/LoginPage'
import CertificateListPage from './pages/CertificateListPage'
import StudentDashboard from './pages/StudentDashboard'
import SchoolDashboard from './pages/SchoolDashboard'

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/certificates" element={<CertificateListPage />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/school" element={<SchoolDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
