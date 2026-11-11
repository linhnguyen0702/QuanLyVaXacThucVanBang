UPDATE users
SET role = 'student',
    department = NULL,
    position = 'Sinh viên'
WHERE role = 'viewer';

ALTER TABLE users
MODIFY role ENUM('admin', 'school', 'officer', 'student') NOT NULL DEFAULT 'student';

UPDATE roles
SET role_name = 'Sinh viên',
    role_code = 'student',
    description = 'Tra cứu và xem thông tin văn bằng của sinh viên'
WHERE role_code = 'viewer';
