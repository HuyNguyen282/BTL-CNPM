import pool from "../config/connectDB.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
        let id = getRandomIntInclusive(100000, 999999);
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO user (id, username, password, email) VALUES (?, ?, ?, ?)",
            [id, username, hashedPassword, email]
        );
        return res.redirect("/");

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("<script>alert('Email/Username đã tồn tại!'); window.history.back();</script>");
        }
        console.error("Lỗi đăng ký:", err);
        return res.status(500).send("<script>alert('Lỗi server khi đăng ký'); window.history.back();</script>");
    }
};

export const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await pool.query(
            "SELECT * FROM user WHERE username = ? OR email = ?",
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
        return res.redirect("/trang_chu/dashboard");

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

        const [rows] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).send("<script>alert('Email không tồn tại!'); window.history.back();</script>");
        }

        const token = crypto.randomInt(100000, 999999).toString();
        const expire = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            "UPDATE user SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
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
            "SELECT * FROM user WHERE email = ? AND reset_token = ?",
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
            "UPDATE user SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE email = ?",
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

export const trang_chu = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }
        const { totalMonthExpense, totalMonthIncome } = req.query;
        const user_id = req.session.user.id;

        //Tổng thu nhập - chi tiêu tháng hiện tại
        const [rows] = await pool.query(`
        SELECT 
        SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense
        FROM transactions t
        JOIN categories c ON t.category_id = c.category_id
        WHERE 
        t.user_id = ? 
        AND MONTH(t.date) = MONTH(CURRENT_DATE())
        AND YEAR(t.date) = YEAR(CURRENT_DATE())`, [user_id]);

        //Số hạng mục
        const [rowsCategory] = await pool.query(`
            SELECT COUNT(*) AS category_count
            FROM categories
            WHERE user_id = ?`, [user_id]);

        //Danh mục chi tiêu lớn nhất
        const [topCategory] = await pool.query(`
            SELECT 
            c.name AS category_name,
            SUM(t.amount) AS total_spent
            FROM transactions t
            JOIN categories c ON t.category_id = c.category_id
            WHERE 
            t.user_id = ?
            AND c.type = 'expense'
            AND MONTH(t.date) = MONTH(CURRENT_DATE())
            AND YEAR(t.date) = YEAR(CURRENT_DATE())
            GROUP BY c.category_id
            ORDER BY total_spent DESC
            LIMIT 1`, [user_id]);

        //Thông tin user
        const [userDetails] = await pool.query("SELECT username, email from user where id = ?", [user_id]);
        const user_details = userDetails[0];

        const total_income = rows[0]?.total_income || 0;
        const total_expense = rows[0]?.total_expense || 0;
        const category_count = rowsCategory[0]?.category_count || 0;
        const top_category = topCategory[0]?.category_name || "Chưa có";
        return res.render("contents/trang_chu.ejs", { total_income, total_expense, category_count, top_category, user_details });

    } catch (err) {
        console.error("Lỗi khi load trang_chu:", err);
        return res.status(500).send("Lỗi server khi tải trang chủ");
    }
};

export const budgetPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }
        const user_id = req.session.user.id;

        //Thông tin user
        const [userDetails] = await pool.query("SELECT username, email from user where id = ?", [user_id]);
        const user_details = userDetails[0];

        res.render("contents/Budget.ejs", { user_details });

    } catch (err) {
        console.error("Lỗi khi load trang_chu:", err);
        return res.status(500).send("Lỗi server khi tải trang chủ");
    }

};

export const handlebudgetPage = async (req, res) => {
    const { budgetName, amount, startDate, endDate, note } = req.body;
    const user_id = req.session.user.id;
    const [userDetails] = await pool.query("SELECT username, email from user where id = ?", [user_id]);
    const user_details = userDetails[0];
    await pool.query("INSERT INTO budgets (user_id, budget_name, amount, start_date, end_date, note) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, budgetName, amount, startDate, endDate, note]);
    res.redirect("/trang_chu/viewbud");
};


export const viewbudPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }

        const user_id = req.session.user.id;

        const [userDetails] = await pool.query(
            "SELECT username, email FROM user WHERE id = ?",
            [user_id]
        );
        const user_details = userDetails[0] || {};

        const [budgets] = await pool.query(
            "SELECT * FROM budgets WHERE user_id = ?",
            [user_id]
        );

        res.render("contents/viewbud.ejs", {
            user_details,
            budgets,
        });

    } catch (err) {
        console.error("Lỗi khi tải trang viewbud:", err);
        res.status(500).send("Lỗi server khi tải trang hạn mức");
    }
};

export const updateBudget = async (req, res) => {
    try {
        const budgetId = req.body.budget_id;
        const userId = req.session.user.id;

        const { budget_name, amount, start_date, end_date, note } = req.body;

        await pool.query(
            "UPDATE budgets SET budget_name = ?, amount = ?, start_date = ?, end_date = ?, note = ? WHERE budget_id = ? AND user_id = ?",
            [budget_name, amount, start_date, end_date, note, budgetId, userId]
        );


        res.redirect("/trang_chu/viewbud");

    } catch (error) {
        console.error("Lỗi khi cập nhật budget:", error);
        res.status(500).send("Lỗi server khi cập nhật budget");
    }
};

export const deleteBudget = async (req, res) => {
    try {

        const budgetId = req.body.budget_id;
        const userId = req.session.user.id;

        await pool.query(
            "DELETE FROM budgets WHERE budget_id = ? AND user_id = ?",
            [budgetId, userId]
        );

        res.redirect("/trang_chu/viewbud");

    } catch (error) {
        console.error("Lỗi khi xóa budget:", error);
        res.status(500).send("Lỗi server khi xóa budget");
    }
};

export const themchitieuPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }

        const user_id = req.session.user.id;

        const [userDetails] = await pool.query(
            "SELECT username, email FROM user WHERE id = ?",
            [user_id]
        );
        const user_details = userDetails[0] || {};

        res.render("contents/themchitieu.ejs", {
            user_details
        });

    } catch (err) {
        console.error("Lỗi khi tải trang viewbud:", err);
        res.status(500).send("Lỗi server khi tải trang hạn mức");
    }
};

export const chinhsuachitieuPage = async (req, res) => {
    res.render("contents/chinhsuakhoanchi.ejs");
};