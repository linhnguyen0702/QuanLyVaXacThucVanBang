-- Create database
CREATE DATABASE IF NOT EXISTS certificate_verification;
USE certificate_verification;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student', 'school', 'admin') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    wallet_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_wallet_address (wallet_address)
);

-- Schools/Universities table
CREATE TABLE IF NOT EXISTS schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    school_code VARCHAR(50) UNIQUE NOT NULL,
    school_type ENUM('university', 'college', 'institute') NOT NULL,
    establishment_year INT,
    license_number VARCHAR(100),
    website VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    wallet_address VARCHAR(42) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_school_code (school_code),
    INDEX idx_wallet_address (wallet_address)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    place_of_birth VARCHAR(255),
    nationality VARCHAR(100) DEFAULT 'Vietnam',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_code (student_code),
    INDEX idx_id_number (id_number)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    school_id INT NOT NULL,
    major VARCHAR(255) NOT NULL,
    degree_type ENUM('bachelor', 'master', 'doctor', 'diploma', 'certificate') NOT NULL,
    education_mode ENUM('fulltime', 'parttime', 'online') DEFAULT 'fulltime',
    gpa DECIMAL(3, 2),
    classification VARCHAR(50),
    issue_date DATE NOT NULL,
    decision_number VARCHAR(100),
    certificate_hash VARCHAR(255) UNIQUE NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    blockchain_certificate_id INT,
    ipfs_hash VARCHAR(255),
    qr_code_url VARCHAR(255),
    pdf_url VARCHAR(255),
    status ENUM('pending', 'issued', 'revoked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_certificate_code (certificate_code),
    INDEX idx_certificate_hash (certificate_hash),
    INDEX idx_blockchain_tx_hash (blockchain_tx_hash),
    INDEX idx_status (status),
    INDEX idx_student_id (student_id),
    INDEX idx_school_id (school_id)
);

-- Certificate verification logs table
CREATE TABLE IF NOT EXISTS verification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_id INT NOT NULL,
    verifier_ip VARCHAR(45),
    verifier_user_agent TEXT,
    verification_method ENUM('qr_code', 'certificate_code', 'hash') NOT NULL,
    verification_result BOOLEAN NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    INDEX idx_certificate_id (certificate_id),
    INDEX idx_verified_at (verified_at)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- Sessions table (for JWT token blacklist)
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Insert sample admin user
INSERT INTO users (email, password_hash, full_name, role, is_active) 
VALUES (
    'admin@example.com', 
    '$2a$10$rBV2VZ3Z0HkV9qQ5V5pZ3e5YZ0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z0Z3Z', 
    'System Administrator',
    'admin',
    TRUE
);
