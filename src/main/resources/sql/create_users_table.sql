-- Create users table for HR system
-- This script will create users table with required fields

-- Drop table if exists
DROP TABLE users CASCADE CONSTRAINTS;

-- Create users table
CREATE TABLE users (
    id NUMBER(19) PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) NOT NULL UNIQUE,
    phone VARCHAR2(20),
    role VARCHAR2(20) NOT NULL CHECK (role IN ('ADMIN', 'HR', 'EMPLOYEE')),
    status VARCHAR2(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    department_id NUMBER(19),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create sequence for ID
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

-- Create trigger for auto ID generation
CREATE OR REPLACE TRIGGER users_id_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := users_seq.NEXTVAL;
    END IF;
END;
/

-- Create trigger for auto updated_at
CREATE OR REPLACE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Create departments table (if not exists)
CREATE TABLE departments (
    id NUMBER(19) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    description VARCHAR2(500),
    manager_id NUMBER(19),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sequence for departments
CREATE SEQUENCE departments_seq START WITH 1 INCREMENT BY 1;

-- Create trigger for departments
CREATE OR REPLACE TRIGGER departments_id_trigger
    BEFORE INSERT ON departments
    FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := departments_seq.NEXTVAL;
    END IF;
END;
/

-- Create foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_department 
    FOREIGN KEY (department_id) REFERENCES departments(id);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department_id ON users(department_id);

-- Insert sample data for departments
INSERT INTO departments (name, description) VALUES ('IT', 'Information Technology Department');
INSERT INTO departments (name, description) VALUES ('HR', 'Human Resources Department');
INSERT INTO departments (name, description) VALUES ('Finance', 'Finance Department');
INSERT INTO departments (name, description) VALUES ('Marketing', 'Marketing Department');
INSERT INTO departments (name, description) VALUES ('Sales', 'Sales Department');
INSERT INTO departments (name, description) VALUES ('Operations', 'Operations Department');
INSERT INTO departments (name, description) VALUES ('Legal', 'Legal Department');
INSERT INTO departments (name, description) VALUES ('Admin', 'Administration Department');

COMMIT;