import pool from "../config/connectDB.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

export const getHomePage = async (req, res) => {
    return res.render("index.ejs");
};

export const signUpPage = (req, res) => {
    return res.render("newUser.ejs");
};

export const handleSignUp = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).send("<script>alert('Mật khẩu không khớp!'); window.history.back();</script>");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );
        return res.redirect("/");

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("<script>alert('Email/Username đã tồn tại!'); window.history.back();</script>");
        }
        return res.status(500).send("<script>alert('Lỗi server khi đăng ký'); window.history.back();</script>");
    }
};

export const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ? OR email = ?",
            [username, username]
        );

        if (rows.length === 0) {
            return res.status(400).send("<script>alert('Người dùng không tồn tại!'); window.history.back();</script>");
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send("<script>alert('Sai mật khẩu!'); window.history.back();</script>");
        }
        req.session.user = user;
        return res.redirect("/trangchu");

    } catch (err) {
        console.error("Lỗi login:", err);
        return res.status(500).send("<script>alert('Lỗi server khi login'); window.history.back();</script>");
    }
};

export const enterMailPage = (req, res) => {
    return res.render("enterMail.ejs");
};
export const handleSendMail = async (req, res) => {
    try {
        const { email } = req.body;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).send("<script>alert('Email không tồn tại!'); window.history.back();</script>");
        }

        const token = crypto.randomInt(100000, 999999).toString();
        const expire = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            "UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
            [token, expire, email]
        );

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:2006/forgot?token=${token}&email=${email}`;

        await transporter.sendMail({
            from: '"Egghead App" <no-reply@egghead.com>',
            to: email,
            subject: "Đặt lại mật khẩu",
            html: `
                <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
                <p>Nhấn vào link để đổi mật khẩu: <a href="${resetLink}">${resetLink}</a></p>
                <p>Hoặc nhập token: <b>${token}</b></p>
                <p><i>Đường dẫn tồn tại trong 5 phút.</i></p>
            `,
        });

        return res.send("<script>alert('Link đặt lại mật khẩu đã được gửi về email!'); window.location.href='/';</script>");

    } catch (err) {
        console.error("Lỗi reset password:", err);
        return res.status(500).send("Lỗi server khi reset password");
    }
};

export const forgotPasswordPage = (req, res) => {
    const { token, email } = req.query
    return res.render("forgot-pwd.ejs", { token, email });
};

export const handleResetPasswordRequest = async (req, res) => {
    try {
        const { password, confirmPassword, token, email } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send("<script>alert('Mật khẩu không khớp!'); window.history.back();</script>");
        }

        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ? AND reset_token = ?",
            [email, token]
        );

        if (rows.length === 0) {
            return res.status(400).send("<script>alert('Token hoặc email không hợp lệ!'); window.history.back();</script>");
        }

        const user = rows[0];
        if (new Date(user.reset_token_expire) < new Date()) {
            return res.status(400).send("<script>alert('Token đã hết hạn!'); window.history.back();</script>");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE email = ?",
            [hashedPassword, email]
        );

        return res.send("<script>alert('Đặt lại mật khẩu thành công!'); window.location.href='/';</script>");
    } catch (err) {
        console.error("Lỗi reset password:", err);
        return res.status(500).send("Lỗi server khi reset password");
    }
};

export const handleLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect("/");
    });
};

export const mainPage = (req, res) => {
    return res.render("main.ejs");
};

export const loadContent = (req, res) => {
    const page = req.params.page;
    res.render(`contents/${page}.ejs`, {}, (err, html) => {
        if (err) {
            console.error("Lỗi khi tải trang:", err.message);
            return res.status(404).send(`<p class="text-danger text-center mt-5">❌ Không tìm thấy trang: ${page}</p>`);
        }
        res.send(html);
    });
};