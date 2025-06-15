
-- Enhanced AWC Logistics Database with Invoice Structure
CREATE DATABASE IF NOT EXISTS awc_logistics_db;
USE awc_logistics_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales_director', 'sales_agent', 'finance_officer') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    tin_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotations table (enhanced)
CREATE TABLE quotations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT,
    volume VARCHAR(50) NOT NULL,
    buy_rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    client_quote DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    profit_percentage VARCHAR(10) NOT NULL,
    quote_sent_by INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'won', 'lost') DEFAULT 'pending',
    follow_up_date DATE,
    remarks TEXT,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    destination VARCHAR(100),
    door_delivery VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (quote_sent_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Invoices table (enhanced based on screenshot)
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quotation_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    destination VARCHAR(100),
    door_delivery VARCHAR(100),
    salesperson VARCHAR(100),
    deliver_date DATE,
    payment_conditions TEXT,
    validity_date DATE,
    awb_number VARCHAR(50),
    sub_total DECIMAL(10,2) DEFAULT 0,
    tva DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Invoice items table (for line items in invoice)
CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) DEFAULT 0,
    commodity VARCHAR(200),
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Company settings table
CREATE TABLE company_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(200) DEFAULT 'Africa World Cargo Ltd/',
    tin_number VARCHAR(50) DEFAULT 'TIN: 112933303 RW',
    address TEXT DEFAULT 'KN 5 rd, AVIB, 30 Remera\nKigali, Rwanda',
    bank_name VARCHAR(100) DEFAULT 'Bank of Kigali',
    bank_accounts TEXT DEFAULT '00265 077713610/Rwf\n00265-07771427-09/Eur\n00265-07771426-08/Usd',
    swift_code VARCHAR(20) DEFAULT 'BKIGRWRW',
    phone VARCHAR(50) DEFAULT '+250 784 445 373',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@awclogistics.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Sales Director', 'john@awclogistics.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_director'),
('Mike Sales Agent', 'mike@awclogistics.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales_agent'),
('Lisa Finance', 'lisa@awclogistics.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'finance_officer');

INSERT INTO company_settings (id) VALUES (1);

INSERT INTO clients (company_name, contact_person, tin_number, address, city, country, phone, email) VALUES 
('Michel-TLC', 'Michel', '', 'Goma', 'Goma', 'DRC', '', 'michel@tlc.com'),
('ABC Corporation', 'John Doe', 'TIN123456', '123 Business St', 'Kigali', 'Rwanda', '+250788123456', 'john@abc.com');
