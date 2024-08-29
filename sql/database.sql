CREATE DATABASE my_database;
USE my_database;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Alice Johnson', 'alice@example.com'),
('Bob Brown', 'bob@example.com'),
('Charlie White', 'charlie@example.com');
SELECT * FROM users;
UPDATE users
SET name = 'John Updated', email = 'john_updated@example.com'
WHERE id = 1;
DELETE FROM users
WHERE id = 3;
SELECT * FROM users
WHERE email LIKE '%@example.com';