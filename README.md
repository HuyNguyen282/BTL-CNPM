# CÀI ĐẶT VÀ SỬ DỤNG

Phần mềm quản lý tài chính cá nhân là công cụ giúp người dùng theo dõi và lập kế hoạch quản lý chi tiêu một cách hiệu quả 

## Các tính năng chính

- Đăng kí/đăng nhập
- Quản lý tài khoản
- Quản lý thu chi 
- Thống kê chi tiêu và thu nhập 
- Cùng các chức năng khác
### Công nghệ sử dụng 
- HTML/CSS/Javascript
- Bootstrap
- NodeJS
#### Hướng dẫn cài đặt và sử dụng 
**Bước 1**: Cài đặt
    -Mở CMD cd về thư mục muốn lưu repo
    -Copy lệnh: `git clone git@github.com:HuyNguyen282/BTL-CNPM.git`
    -Cài đặt package cần thiết: `npm ci (hoặc npm install)`
**Bước 2**: Chỉnh database
-Truy cập theo đường dẫn `/src/config/connectDB.js`
-Đổi host, user, password theo **MySQL Workbench** trên máy
-Mở **MySQL Workbench**, chạy lệnh theo thứ tự:
```
(1) create database a;
(2) use a;
(3) CREATE TABLE users (
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY,
  password VARCHAR(255) NOT NULL
);
```
**Bước 3**: Chạy trên localhost
- `npm start`
- Terminal sẽ hiện ra đường dẫn localhost
- `Ctrl + Click` để tự động chuyển sang trình duyệt
