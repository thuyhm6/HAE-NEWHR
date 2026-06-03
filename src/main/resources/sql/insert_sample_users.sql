-- Insert sample data for users table
-- Passwords are SHA-256 encrypted

-- Admin user (admin/admin123)
INSERT INTO users (username, password, full_name, email, phone, role, status, department_id) VALUES (
    'admin', 
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- admin123
    'Administrator', 
    'admin@hrsystem.com', 
    '0123456789', 
    'ADMIN', 
    'ACTIVE', 
    1
);

-- HR user (hr/hr123)
INSERT INTO users (username, password, full_name, email, phone, role, status, department_id) VALUES (
    'hr', 
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- hr123
    'HR Manager', 
    'hr@hrsystem.com', 
    '0123456788', 
    'HR', 
    'ACTIVE', 
    2
);

-- Employee user (employee/emp123)
INSERT INTO users (username, password, full_name, email, phone, role, status, department_id) VALUES (
    'employee', 
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', -- emp123
    'John Doe', 
    'john.doe@hrsystem.com', 
    '0123456787', 
    'EMPLOYEE', 
    'ACTIVE', 
    1
);

-- Test user (test/test123)
INSERT INTO users (username, password, full_name, email, phone, role, status, department_id) VALUES (
    'test', 
    '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', -- test123
    'Test User', 
    'test@hrsystem.com', 
    '0123456786', 
    'EMPLOYEE', 
    'ACTIVE', 
    3
);

-- Manager user (manager/manager123)
INSERT INTO users (username, password, full_name, email, phone, role, status, department_id) VALUES (
    'manager', 
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- manager123
    'Department Manager', 
    'manager@hrsystem.com', 
    '0123456785', 
    'HR', 
    'ACTIVE', 
    4
);

-- Update creation time
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

COMMIT;

-- Demo login credentials:
-- admin / admin123 (Administrator)
-- hr / hr123 (HR Manager)  
-- employee / emp123 (John Doe)
-- test / test123 (Test User)
-- manager / manager123 (Department Manager)