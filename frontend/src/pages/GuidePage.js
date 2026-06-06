import React from 'react';
import { FaQrcode, FaUniversity, FaUserGraduate, FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';
import './GuidePage.css';

const GuidePage = () => {
  return (
    <div className="guide-page">
      <div className="guide-header">
        <div className="container">
          <h1>HƯỚNG DẪN SỬ DỤNG</h1>
          <p>Tìm hiểu cách sử dụng Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số</p>
        </div>
      </div>

      <div className="container">
        <div className="guide-content">
          <section className="guide-section">
            <h2>HƯỚNG DẪN NHANH</h2>
            <div className="quick-guides">
              <div className="quick-guide-card">
                <div className="guide-icon">
                  <FaUniversity />
                </div>
                <h3>1. Dành cho Sinh viên</h3>
                <p>Hướng dẫn tra cứu, xem và tải văn bằng, chứng chỉ số</p>
              </div>
              
              <div className="quick-guide-card">
                <div className="guide-icon">
                  <FaUniversity />
                </div>
                <h3>2. Dành cho Nhà trường</h3>
                <p>Hướng dẫn cấp, quản lý và ký số văn bằng, chứng chỉ cho nhà trường</p>
              </div>
              
              <div className="quick-guide-card">
                <div className="guide-icon">
                  <FaQrcode />
                </div>
                <h3>3. Xác thực văn bằng</h3>
                <p>Hướng dẫn xác thực văn bằng, chứng chỉ qua mã QR hoặc nhập mã</p>
              </div>
              
              <div className="quick-guide-card">
                <div className="guide-icon">
                  <FaQuestionCircle />
                </div>
                <h3>4. Câu hỏi thường gặp</h3>
                <p>Giải đáp các thắc mắc thường gặp khi sử dụng hệ thống</p>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h2>QUY TRÌNH SỬ DỤNG HỆ THỐNG</h2>
            
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Đăng ký tài khoản</h3>
                <p>Liên hệ quản trị hệ thống để được cấp tài khoản sử dụng. Nhà trường cần cung cấp thông tin pháp lý và ký hợp đồng sử dụng dịch vụ.</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Đăng nhập vào hệ thống</h3>
                <p>Sử dụng tài khoản đã được cấp để đăng nhập vào hệ thống. Chọn vai trò phù hợp (Sinh viên hoặc Nhà trường).</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Quản lý / Tra cứu văn bằng</h3>
                <p><strong>Nhà trường:</strong> Sử dụng chức năng cấp và ký số văn bằng. Mỗi văn bằng được ghi lên Blockchain và cấp mã định danh duy nhất.</p>
                <p><strong>Sinh viên:</strong> Xem thông tin văn bằng đã được cấp và tải về dưới dạng PDF hoặc NFT.</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Xác thực thông tin</h3>
                <p>Bất kỳ ai cũng có thể xác thực văn bằng bằng cách quét mã QR hoặc nhập mã xác thực. Hệ thống sẽ trả kết quả ngay lập tức.</p>
              </div>
            </div>
          </section>

          <section className="guide-section faq-section">
            <h2>CÂU HỎI THƯỜNG GẶP</h2>
            
            <div className="faq-item">
              <h4>Làm sao để biết văn bằng được cấp bởi hệ thống có hợp pháp?</h4>
              <p>Văn bằng, chứng chỉ số có gì khác so với hình thức cấp bằng giấy truyền thống?</p>
            </div>

            <div className="faq-item">
              <h4>Văn bằng, chứng chỉ số có gì khác so với hình thức cấp bằng giấy truyền thống?</h4>
              <p>Văn bằng số được lưu trữ trên Blockchain, không thể làm giả, xác thực nhanh chóng và dễ dàng chia sẻ.</p>
            </div>

            <div className="faq-item">
              <h4>Tôi có thể tải văn bằng, chứng chỉ số về máy không?</h4>
              <p>Có, bạn có thể tải văn bằng về dưới dạng PDF hoặc lưu trữ dưới dạng NFT trên ví Blockchain của bạn.</p>
            </div>

            <div className="faq-item">
              <h4>Quyền lợi khoản thị pháp làm sao?</h4>
              <p>Văn bằng số có giá trị pháp lý tương đương với văn bằng giấy theo quy định của pháp luật.</p>
            </div>

            <div className="faq-item">
              <h4>Thông tin của tôi có được bảo mật không?</h4>
              <p>Hệ thống chỉ lưu trữ mã hash của văn bằng trên Blockchain. Thông tin chi tiết được mã hóa và lưu trữ an toàn.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
