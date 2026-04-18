-- ============================================================
-- GST Billing Pro – Database Seed Script
-- Run AFTER Spring Boot starts (tables auto-created by JPA)
-- mysql -u root -p gst_billing_db < seed.sql
-- ============================================================

-- Admin user — password is: admin123
-- BCrypt hash verified with Spring Security BCryptPasswordEncoder
INSERT INTO users (username, password, email, full_name, role, created_at)
SELECT 'admin',
       '$2a$10$slYQmyNdgTY18LdORTBTOuroDvBpgGVvVb0bFpkxkRSTcIRfoOeBO',
       'admin@gstbilling.com',
       'Admin User',
       'ADMIN',
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Company profile
INSERT INTO company_profile (
  name, address, city, state, state_code, pincode,
  phone, email, website, gstin, pan_number,
  bank_name, account_number, ifsc_code, bank_branch,
  invoice_prefix, invoice_counter
)
SELECT
  'My Business Pvt Ltd',
  '123 MG Road, Anna Nagar',
  'Chennai', 'Tamil Nadu', '33', '600040',
  '+91 98765 43210', 'billing@mybusiness.com', 'https://mybusiness.com',
  '33AABCM1234A1ZP', 'AABCM1234A',
  'State Bank of India', '12345678901234', 'SBIN0001234', 'Anna Nagar Branch',
  'INV', 1
WHERE NOT EXISTS (SELECT 1 FROM company_profile LIMIT 1);

-- Sample customers
INSERT INTO customers (name, email, phone, address, city, state, state_code, pincode, gstin, pan_number, is_active, created_at)
SELECT 'Rajan Enterprises','rajan@rajanent.com','9876543210','45 T Nagar, Main Road','Chennai','Tamil Nadu','33','600017','33AABCR9876B1Z1','AABCR9876B',1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email='rajan@rajanent.com');

INSERT INTO customers (name, email, phone, address, city, state, state_code, pincode, gstin, pan_number, is_active, created_at)
SELECT 'Vijay Traders','vijay@vijaytraders.in','9845612378','12 Anna Salai','Chennai','Tamil Nadu','33','600002','33AABCV5432C1Z2','AABCV5432C',1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email='vijay@vijaytraders.in');

INSERT INTO customers (name, email, phone, address, city, state, state_code, pincode, gstin, pan_number, is_active, created_at)
SELECT 'Mumbai Tech Pvt Ltd','info@mumbaitech.com','9123456789','501 Bandra Kurla Complex','Mumbai','Maharashtra','27','400051','27AABCM7654D1Z3','AABCM7654D',1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email='info@mumbaitech.com');

INSERT INTO customers (name, email, phone, address, city, state, state_code, pincode, gstin, pan_number, is_active, created_at)
SELECT 'Delhi Solutions','ops@delhisol.com','9988776655','88 Connaught Place','New Delhi','Delhi','07','110001','07AABCD1122E1Z4','AABCD1122E',1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email='ops@delhisol.com');

-- Sample products
INSERT INTO products (name, description, hsn_code, price, unit, gst_rate, stock_quantity, is_active, created_at)
SELECT 'Web Development Services','Custom website development','998313',50000.00,'Hr',18,100,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Web Development Services');

INSERT INTO products (name, description, hsn_code, price, unit, gst_rate, stock_quantity, is_active, created_at)
SELECT 'Cloud Hosting (Annual)','Managed cloud server hosting','997314',12000.00,'Nos',18,50,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Cloud Hosting (Annual)');

INSERT INTO products (name, description, hsn_code, price, unit, gst_rate, stock_quantity, is_active, created_at)
SELECT 'Laptop – 15 inch','Business laptop with SSD','847130',65000.00,'Nos',18,20,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Laptop – 15 inch');

INSERT INTO products (name, description, hsn_code, price, unit, gst_rate, stock_quantity, is_active, created_at)
SELECT 'Software License (Annual)','Enterprise software subscription','997331',25000.00,'Nos',18,999,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Software License (Annual)');

INSERT INTO products (name, description, hsn_code, price, unit, gst_rate, stock_quantity, is_active, created_at)
SELECT 'Consulting (per hour)','IT consulting and advisory','998314',3000.00,'Hr',18,999,1,NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Consulting (per hour)');

-- Verify
SELECT 'Users' tbl, COUNT(*) cnt FROM users
UNION ALL SELECT 'Customers', COUNT(*) FROM customers
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Company', COUNT(*) FROM company_profile;
