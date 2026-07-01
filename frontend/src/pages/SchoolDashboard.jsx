import { FaUniversity, FaPlus, FaList, FaCheckCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import './StudentDashboard.css'

const SchoolDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-main">
        <div className="dashboard-container">
          <h1 className="dashboard-title">Dashboard - Nhà trường</h1>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <FaUniversity className="dashboard-icon" />
              <h3>Thông tin nhà trường</h3>
              <p>Quản lý thông tin đơn vị</p>
            </div>
            <div className="dashboard-card">
              <FaPlus className="dashboard-icon" />
              <h3>Cấp văn bằng mới</h3>
              <p>Tạo và ký số văn bằng mới</p>
            </div>
            <div className="dashboard-card">
              <FaList className="dashboard-icon" />
              <h3>Danh sách văn bằng</h3>
              <Link to="/certificates">Xem danh sách</Link>
            </div>
            <div className="dashboard-card">
              <FaCheckCircle className="dashboard-icon" />
              <h3>Xác thực văn bằng</h3>
              <Link to="/verify">Xác thực ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolDashboard;
