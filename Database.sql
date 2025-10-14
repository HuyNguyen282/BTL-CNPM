--Xóa toàn bộ CSDL (CHỈ CHẠY 1 LẦN)
drop database a;

CREATE DATABASE a;
USE a;

CREATE TABLE user (
    id INT PRIMARY KEY,
    username VARCHAR(36) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    reset_token VARCHAR(6),
    reset_token_expire DATETIME
);
drop table user;
select * from user;

CREATE TABLE budgets (
    budget_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    budget_name VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL,
    note VARCHAR(50),
    start_date DATE DEFAULT (CURRENT_DATE),
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
drop table budgets;
select * from budgets;

CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    budget_id INT NULL,
    transaction_name VARCHAR(36),
    type ENUM('income','expense') NOT NULL DEFAULT 'expense',
    date DATE DEFAULT (CURRENT_DATE),
    amount BIGINT NOT NULL,
    note VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE
);
drop table transactions;
select * from transactions;
