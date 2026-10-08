-- =========================================================================================
-- HỆ THỐNG QUẢN LÝ VÀ XÁC THỰC VĂN BẰNG CHỨNG CHỈ SỐ (DIGITAL CERTIFICATE SYSTEM)
-- FILE KỊCH BẢN CƠ SỞ DỮ LIỆU CHUẨN (COMPLETE DATABASE SCHEMA & INITIAL SEED DATA)
-- Engine: MySQL 8.0+ / MariaDB 10.4+
-- =========================================================================================

CREATE DATABASE IF NOT EXISTS certificate_verification 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE certificate_verification;

-- Tắt kiểm tra khóa ngoại tạm thời để khởi tạo lại bảng
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS verification_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS schools;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================================
-- 1. BẢNG NGƯỜI DÙNG (USERS)
-- Quản lý tất cả tài khoản truy cập hệ thống (Admin, Cán bộ đào tạo, Sinh viên, Khách tra cứu)
-- =========================================================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'school', 'officer', 'viewer', 'student') NOT NULL DEFAULT 'viewer',
    phone VARCHAR(20),
    department VARCHAR(255) DEFAULT 'Phòng Đào tạo',
    position VARCHAR(255) DEFAULT 'Cán bộ quản lý',
    address TEXT,
    avatar_url VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    wallet_address VARCHAR(42),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_wallet_address (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 2. BẢNG TRƯỜNG HỌC / ĐƠN VỊ CẤP BẰNG (SCHOOLS)
-- Quản lý thông tin các Cơ sở giáo dục đại học / Học viện phát hành văn bằng số
-- =========================================================================================
CREATE TABLE schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) UNIQUE NOT NULL,
    school_type ENUM('university', 'college', 'institute') NOT NULL DEFAULT 'university',
    establishment_year INT DEFAULT 2000,
    license_number VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    description TEXT,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    certificate_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_school_code (school_code),
    INDEX idx_wallet_address (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 3. BẢNG CHƯƠNG TRÌNH ĐÀO TẠO (PROGRAMS)
-- Quản lý danh mục các chương trình đào tạo & chuyên ngành học của nhà trường
-- =========================================================================================
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT NOT NULL,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    sub_name VARCHAR(255) DEFAULT 'Chương trình chuẩn',
    department VARCHAR(255) NOT NULL,
    education_system VARCHAR(100) DEFAULT 'Đại học chính quy',
    duration VARCHAR(50) DEFAULT '4 năm',
    status ENUM('active', 'paused', 'completed', 'stopped') DEFAULT 'active',
    issued_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_program_code (program_code),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 4. BẢNG SINH VIÊN (STUDENTS)
-- Quản lý hồ sơ học tập và trạng thái xét duyệt tốt nghiệp của sinh viên
-- =========================================================================================
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    school_id INT NOT NULL,
    school_name VARCHAR(255) DEFAULT 'Trường Đại học Công nghệ',
    student_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') NOT NULL DEFAULT 'Nam',
    id_number VARCHAR(20) UNIQUE NOT NULL,
    place_of_birth VARCHAR(255),
    nationality VARCHAR(100) DEFAULT 'Việt Nam',
    department VARCHAR(255) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    graduation_status ENUM('issued', 'eligible', 'studying', 'suspended') DEFAULT 'eligible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_student_code (student_code),
    INDEX idx_id_number (id_number),
    INDEX idx_graduation_status (graduation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 5. BẢNG VĂN BẰNG CHỨNG CHỈ SỐ (CERTIFICATES)
-- Quản lý dữ liệu văn bằng đã được ký số và cấp phát lên Blockchain Polygon
-- =========================================================================================
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    school_id INT NOT NULL,
    program_id INT,
    student_code VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    degree_type ENUM('Đại học', 'Thạc sĩ', 'Tiến sĩ', 'Cao đẳng', 'Chứng chỉ') NOT NULL DEFAULT 'Đại học',
    education_mode ENUM('Chính quy', 'Vừa học vừa làm', 'Từ xa') DEFAULT 'Chính quy',
    gpa DECIMAL(3, 2),
    classification VARCHAR(50) DEFAULT 'Giỏi',
    issue_date DATE NOT NULL,
    decision_number VARCHAR(100) NOT NULL,
    certificate_hash VARCHAR(255) UNIQUE NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    blockchain_certificate_id INT,
    ipfs_hash VARCHAR(255),
    qr_code_url VARCHAR(500),
    pdf_url VARCHAR(500),
    status ENUM('pending', 'issued', 'revoked') DEFAULT 'issued',
    revoke_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    INDEX idx_certificate_code (certificate_code),
    INDEX idx_certificate_hash (certificate_hash),
    INDEX idx_blockchain_tx_hash (blockchain_tx_hash),
    INDEX idx_status (status),
    INDEX idx_student_code (student_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 6. BẢNG NÓM VAI TRÒ (ROLES)
-- Quản lý các nhóm chức danh và vai trò trong hệ thống
-- =========================================================================================
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(255) NOT NULL,
    role_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 7. BẢNG PHÂN QUYỀN CHI TIẾT (ROLE_PERMISSIONS)
-- Cấu hình ma trận phân quyền truy cập cho từng nhóm vai trò
-- =========================================================================================
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    view_cert BOOLEAN DEFAULT TRUE,
    create_cert BOOLEAN DEFAULT FALSE,
    edit_config BOOLEAN DEFAULT FALSE,
    view_logs BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 8. BẢNG LỊCH SỬ TỆP BÁO CÁO ĐÃ XUẤT (REPORTS)
-- Lưu vết và quản lý các file báo cáo định kỳ đã được trích xuất (Excel, PDF, CSV)
-- =========================================================================================
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    type_key ENUM('issuance', 'blockchain', 'revoked', 'verification', 'external') NOT NULL DEFAULT 'issuance',
    format ENUM('XLSX', 'PDF', 'CSV', 'DOCX') NOT NULL DEFAULT 'XLSX',
    creator_name VARCHAR(255) NOT NULL,
    record_count INT DEFAULT 0,
    file_size VARCHAR(50) DEFAULT '1.5 MB',
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 9. BẢNG NHẬT KÝ TRA CỨU VÀ XÁC THỰC (VERIFICATION_LOGS)
-- Lưu vết các lượt quét mã QR & tra cứu chuỗi băm văn bằng từ công chúng/doanh nghiệp
-- =========================================================================================
CREATE TABLE verification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_id INT,
    certificate_code VARCHAR(50),
    verifier_ip VARCHAR(45),
    verifier_user_agent TEXT,
    verification_method ENUM('qr_code', 'certificate_code', 'hash') NOT NULL DEFAULT 'qr_code',
    verification_result BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE SET NULL,
    INDEX idx_certificate_code (certificate_code),
    INDEX idx_verified_at (verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 10. BẢNG NHẬT KÝ BẢO MẬT & HỆ THỐNG (AUDIT_LOGS)
-- Ghi lại mọi hành động thêm/sửa/xóa và thay đổi cấu hình của quản trị viên
-- =========================================================================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_value LONGTEXT,
    new_value LONGTEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================================
-- 11. BẢNG PHIÊN ĐĂNG NHẬP & TOKEN (SESSIONS)
-- =========================================================================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================================
-- NẠP DỮ LIỆU MẪU BAN ĐẦU (INITIAL SEED DATA)
-- =========================================================================================

-- 1. Thêm tài khoản người dùng mẫu
INSERT INTO users (email, password_hash, full_name, role, phone, department, position, wallet_address, is_active) VALUES 
('admin@school.edu.vn', '$2a$10$rBV2VZ3Z0HkV9qQ5V5pZ3e5YZ0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z', 'Nguyễn Văn An', 'admin', '0368 251 814', 'Phòng Đào tạo', 'Quản trị viên Hệ thống Văn bằng số', '0xA3f2d9b7eC81452D819280dEAc429e81', TRUE),
('officer@school.edu.vn', '$2a$10$rBV2VZ3Z0HkV9qQ5V5pZ3e5YZ0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z', 'Lê Hoài Nam', 'officer', '0912 345 678', 'Phòng Đào tạo', 'Cán bộ nhập liệu văn bằng', '0xB821c9e4a11295D31918aC391e82A123', TRUE),
('viewer@school.edu.vn', '$2a$10$rBV2VZ3Z0HkV9qQ5V5pZ3e5YZ0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z', 'Phạm Thị D', 'viewer', '0988 777 666', 'Khoa Công nghệ thông tin', 'Nhân viên tra cứu', NULL, TRUE);

-- 2. Thêm trường học mẫu
INSERT INTO schools (user_id, school_name, school_code, school_type, establishment_year, license_number, website, wallet_address, is_verified, certificate_count) VALUES 
(1, 'Trường Đại học Công nghệ - ĐHQGHN', 'UET-VNU', 'university', 2004, 'GP-1234/BGDDT', 'https://uet.vnu.edu.vn', '0xA3f2d9b7eC81452D819280dEAc429e81', TRUE, 12450),
(NULL, 'Trường Đại học Bách khoa Hà Nội', 'HUST', 'university', 1956, 'GP-5678/BGDDT', 'https://hust.edu.vn', '0xB821c9e4a11295D31918aC391e82A123', TRUE, 28900),
(NULL, 'Học viện Công nghệ Bưu chính Viễn thông', 'PTIT', 'institute', 1997, 'GP-9912/BGDDT', 'https://ptit.edu.vn', '0xC918237192831823719bA90812736154', FALSE, 8400);

-- 3. Thêm chương trình đào tạo mẫu
INSERT INTO programs (school_id, program_code, program_name, sub_name, department, education_system, duration, status, issued_count) VALUES 
(1, 'CTDT-CNTT-01', 'Công nghệ thông tin', 'Chương trình chuẩn', 'Khoa Công nghệ thông tin', 'Đại học chính quy', '4 năm', 'active', 2856),
(1, 'CTDT-ATPM-01', 'Kỹ thuật phần mềm', 'Chương trình chuẩn', 'Khoa Công nghệ thông tin', 'Đại học chính quy', '4 năm', 'active', 1928),
(1, 'CTDT-HTTT-01', 'Hệ thống thông tin', 'Chương trình chuẩn', 'Khoa Công nghệ thông tin', 'Đại học chính quy', '4 năm', 'active', 1256),
(1, 'CTDT-QTKD-01', 'Quản trị kinh doanh', 'Chương trình chuẩn', 'Khoa Kinh tế', 'Đại học chính quy', '4 năm', 'active', 3102);

-- 4. Thêm sinh viên mẫu
INSERT INTO students (user_id, school_id, school_name, student_code, full_name, email, date_of_birth, gender, id_number, place_of_birth, nationality, department, class_name, graduation_status) VALUES 
(NULL, 1, 'Trường Đại học Công nghệ - ĐHQGHN', '20201123', 'Trần Thị B', 'tranthib@school.edu.vn', '2002-05-14', 'Nữ', '001198001234', 'Hà Nội', 'Việt Nam', 'Công nghệ thông tin', 'CNTT-01 K65', 'issued'),
(NULL, 1, 'Trường Đại học Công nghệ - ĐHQGHN', '20203492', 'Lê Văn C', 'levanc@school.edu.vn', '2002-08-20', 'Nam', '001198005678', 'Hải Phòng', 'Việt Nam', 'Khoa học máy tính', 'KHMT-02 K65', 'eligible'),
(NULL, 1, 'Trường Đại học Công nghệ - ĐHQGHN', '20210045', 'Phạm Minh Tuấn', 'tuanpm@school.edu.vn', '2003-01-10', 'Nam', '001198009988', 'Nam Định', 'Việt Nam', 'Kỹ thuật phần mềm', 'KTPM-01 K66', 'studying');

-- 5. Thêm văn bằng đã cấp mẫu
INSERT INTO certificates (certificate_code, student_id, school_id, program_id, student_code, student_name, major, degree_type, education_mode, gpa, classification, issue_date, decision_number, certificate_hash, blockchain_tx_hash, status) VALUES 
('UNI-2026-0012', 1, 1, 1, '20201123', 'Trần Thị B', 'Công nghệ thông tin', 'Đại học', 'Chính quy', 3.65, 'Xuất sắc', '2026-07-25', 'QĐ-125/QĐ-ĐH', '0x8f2a91b4c3d7e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', '0xa1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', 'issued'),
('UNI-2026-0013', 2, 1, 2, '20203492', 'Lê Văn C', 'Kỹ thuật phần mềm', 'Đại học', 'Chính quy', 3.42, 'Giỏi', '2026-07-24', 'QĐ-125/QĐ-ĐH', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', '0xf0e9d8c7b6a543210987654321fedcba0987654321fedcba0987654321fedcba', 'issued');

-- 6. Thêm nhóm vai trò mẫu
INSERT INTO roles (role_name, role_code, description, is_system) VALUES 
('Quản trị viên (Admin)', 'admin', 'Quyền cao nhất hệ thống, toàn quyền quản lý nhà trường', TRUE),
('Cán bộ đào tạo', 'officer', 'Cán bộ phòng đào tạo được cấp quyền duyệt & phát hành văn bằng', TRUE),
('Nhân viên tra cứu', 'viewer', 'Chỉ được xem danh sách và tra cứu văn bằng', TRUE);

-- 7. Thêm phân quyền ma trận mẫu
INSERT INTO role_permissions (role_id, view_cert, create_cert, edit_config, view_logs) VALUES 
(1, TRUE, TRUE, TRUE, TRUE),
(2, TRUE, TRUE, FALSE, FALSE),
(3, TRUE, FALSE, FALSE, FALSE);

-- 8. Thêm lịch sử tệp báo cáo mẫu
INSERT INTO reports (file_name, report_type, type_key, format, creator_name, record_count, file_size) VALUES 
('Bao_Cao_Phat_Hanh_Van_Bang_Q3_2026.xlsx', 'Báo cáo phát hành văn bằng', 'issuance', 'XLSX', 'Nguyễn Văn An (Admin)', 1250, '1.4 MB'),
('Bao_Cao_Doi_Soat_Blockchain_Thang9.pdf', 'Báo cáo đối soát Blockchain', 'blockchain', 'PDF', 'Nguyễn Văn An (Admin)', 4820, '3.8 MB'),
('Danh_Sach_Van_Bang_Thu_Hoi_2026.pdf', 'Báo cáo văn bằng thu hồi', 'revoked', 'PDF', 'Lê Hoài Nam (Cán bộ)', 12, '650 KB');

-- 9. Thêm nhật ký tra cứu mẫu
INSERT INTO verification_logs (certificate_id, certificate_code, verifier_ip, verification_method, verification_result) VALUES 
(1, 'UNI-2026-0012', '192.168.1.45', 'qr_code', TRUE),
(2, 'UNI-2026-0013', '14.162.18.90', 'hash', TRUE);

-- 10. Thêm audit log mẫu
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address) VALUES 
(1, 'CREATE_CERTIFICATE', 'certificates', 1, NULL, 'Cấp bằng cho sinh viên Trần Thị B', '192.168.1.45');
