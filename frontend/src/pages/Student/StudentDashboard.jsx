import { FaUser, FaGraduationCap, FaDownload, FaQrcode } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import './StudentDashboard.css'

const StudentDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-main">
        <div className="dashboard-container">
          <h1 className="dashboard-title">Dashboard - Sinh viên</h1>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <FaUser className="dashboard-icon" />
              <h3>Thông tin cá nhân</h3>
              <p>Xem và cập nhật thông tin</p>
            </div>
            <div className="dashboard-card">
              <FaGraduationCap className="dashboard-icon" />
              <h3>Văn bằng của tôi</h3>
              <p>Xem danh sách văn bằng đã cấp</p>
            </div>
            <div className="dashboard-card">
              <FaDownload className="dashboard-icon" />
              <h3>Tải văn bằng</h3>
              <p>Tải văn bằng định dạng PDF</p>
            </div>
            <div className="dashboard-card">
              <FaQrcode className="dashboard-icon" />
              <h3>Xác thực văn bằng</h3>
              <Link to="/verify">Xác thực ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard;
