import React from 'react';
import './IntroductionPage.css';

const IntroductionPage = () => {
  return (
    <div className="introduction-page">
      <div className="intro-header">
        <div className="container">
          <h1>GIỚI THIỆU</h1>
          <p>Về Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số</p>
        </div>
      </div>

      <div className="container">
        <div className="intro-content">
          <section className="intro-section">
            <h2>Giới thiệu chung</h2>
            <p>
              Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số là một nền tảng công nghệ 
              hiện đại, ứng dụng Blockchain nhằm giải quyết bài toán văn bằng giả - một vấn đề 
              đang gây nhiều lo ngại trong lĩnh vực giáo dục.
            </p>
            <p>
              Với công nghệ Blockchain, mỗi văn bằng được cấp sẽ có một mã định danh duy nhất 
              và được ghi lại trên sổ cái phân tán, đảm bảo tính minh bạch, bảo mật và không 
              thể thay đổi hoặc làm giả.
            </p>
          </section>

          <section className="intro-section">
            <h2>Vấn đề cần giải quyết</h2>
            <div className="problem-list">
              <div className="problem-item">
                <h4>Văn bằng giả tràn lan</h4>
                <p>
                  Hiện tượng làm giả văn bằng, chứng chỉ đang gia tăng và gây ảnh hưởng nghiêm trọng 
                  đến uy tín của các cơ sở giáo dục và thị trường lao động.
                </p>
              </div>
              <div className="problem-item">
                <h4>Xác thực khó khăn</h4>
                <p>
                  Việc xác thực văn bằng giấy tốn nhiều thời gian, chi phí và không đảm bảo độ chính xác 100%.
                </p>
              </div>
              <div className="problem-item">
                <h4>Lưu trữ không an toàn</h4>
                <p>
                  Văn bằng giấy dễ bị hư hỏng, thất lạc hoặc bị làm giả, gây khó khăn trong việc 
                  quản lý và bảo quản.
                </p>
              </div>
            </div>
          </section>

          <section className="intro-section">
            <h2>Giải pháp của chúng tôi</h2>
            <div className="solution-grid">
              <div className="solution-card">
                <h4>Blockchain Technology</h4>
                <p>
                  Sử dụng Ethereum Blockchain để lưu trữ mã hash của văn bằng, đảm bảo tính 
                  bất biến và minh bạch.
                </p>
              </div>
              <div className="solution-card">
                <h4>Smart Contract</h4>
                <p>
                  Tự động hóa quy trình cấp phát và xác thực văn bằng thông qua hợp đồng thông minh.
                </p>
              </div>
              <div className="solution-card">
                <h4>NFT Certificate</h4>
                <p>
                  Cấp văn bằng dưới dạng NFT, cho phép sinh viên sở hữu và quản lý văn bằng số của mình.
                </p>
              </div>
              <div className="solution-card">
                <h4>Digital Signature</h4>
                <p>
                  Ký số điện tử bởi nhà trường, đảm bảo tính pháp lý và xác thực nguồn gốc.
                </p>
              </div>
            </div>
          </section>

          <section className="intro-section tech-section">
            <h2>Công nghệ sử dụng</h2>
            <div className="tech-stack">
              <div className="tech-item">
                <h4>Frontend</h4>
                <p>ReactJS</p>
              </div>
              <div className="tech-item">
                <h4>Backend</h4>
                <p>NodeJS + ExpressJS</p>
              </div>
              <div className="tech-item">
                <h4>Database</h4>
                <p>MySQL</p>
              </div>
              <div className="tech-item">
                <h4>Blockchain</h4>
                <p>Ethereum Sepolia Testnet</p>
              </div>
              <div className="tech-item">
                <h4>Smart Contract</h4>
                <p>Solidity</p>
              </div>
              <div className="tech-item">
                <h4>Blockchain Framework</h4>
                <p>Hardhat</p>
              </div>
              <div className="tech-item">
                <h4>Blockchain Library</h4>
                <p>ethers.js</p>
              </div>
            </div>
          </section>

          <section className="intro-section">
            <h2>Lợi ích</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-number">01</span>
                <div>
                  <h4>Minh bạch và Bảo mật</h4>
                  <p>Mọi thông tin được lưu trữ trên Blockchain, công khai và không thể chỉnh sửa.</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">02</span>
                <div>
                  <h4>Tiết kiệm thời gian và Chi phí</h4>
                  <p>Xác thực tức thì, không cần quy trình thủ công phức tạp.</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">03</span>
                <div>
                  <h4>Không thể làm giả</h4>
                  <p>Dữ liệu được mã hóa và xác thực bằng chữ ký số, đảm bảo tính toàn vẹn.</p>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-number">04</span>
                <div>
                  <h4>Dễ dàng Chia sẻ</h4>
                  <p>Sinh viên có thể chia sẻ văn bằng số cho nhà tuyển dụng một cách nhanh chóng.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="intro-section contact-section">
            <h2>Liên hệ</h2>
            <div className="contact-info">
              <p><strong>Hotline:</strong> 0368251814</p>
              <p><strong>Email:</strong> linhntt.22810310159@epu.edu.vn</p>
              <p><strong>Thời gian làm việc:</strong> Thứ 2 - Thứ 6: 8:00 - 17:30</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;
