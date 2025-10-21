import pool from "../config/connectDB.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { mkConfig, generateCsv, asString } from "export-to-csv";
import dotenv from "dotenv";

dotenv.config();

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

        const resetLink = `http://localhost:8080/forgot?token=${token}&email=${email}`;

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
        if (!req.session.user) return res.redirect("/");

        const user_id = req.session.user.id;

        // Tổng thu nhập - chi tiêu tháng hiện tại
        const [rows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense
            FROM transactions t
            WHERE t.user_id = ?
            AND MONTH(t.date) = MONTH(CURRENT_DATE())
            AND YEAR(t.date) = YEAR(CURRENT_DATE())
        `, [user_id]);

        const [currentMonth] = await pool.query("SELECT MONTH(CURRENT_DATE()) AS month");

        const month = currentMonth[0].month;
        const total_income = rows[0]?.total_income || 0;
        const total_expense = rows[0]?.total_expense || 0;

        // Số hạng mục (dùng budgets)
        const [rowsBudget] = await pool.query(`
            SELECT COUNT(*) AS budget_count
            FROM budgets
            WHERE user_id = ?
        `, [user_id]);

        const category_count = rowsBudget[0]?.budget_count || 0;

        // Hạng mục chi tiêu lớn nhất
        const [topBudget] = await pool.query(`
            SELECT b.budget_name AS category_name, SUM(t.amount) AS total_spent
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.budget_id
            WHERE t.user_id = ? AND t.type = 'expense'
            AND MONTH(t.date) = MONTH(CURRENT_DATE())
            AND YEAR(t.date) = YEAR(CURRENT_DATE())
            GROUP BY b.budget_id
            ORDER BY total_spent DESC
            LIMIT 1
        `, [user_id]);

        const top_category = topBudget[0]?.category_name || "Chưa có";

        // Thông tin user
        const [userDetails] = await pool.query(
            "SELECT username, email FROM user WHERE id = ?",
            [user_id]
        );
        const [balanceTotal] = await pool.query(
            "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance FROM transactions WHERE user_id = ?",
            [user_id]
        );
        const user_details = userDetails[0];
        const balance = balanceTotal[0].balance || 0;

        return res.render("contents/trang_chu.ejs", {
            total_income,
            total_expense,
            category_count,
            top_category,
            user_details,
            month,
            balance
        });

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
        const [balanceTotal] = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
            FROM transactions 
            WHERE user_id = ?`,
            [user_id]
        );
        const balance = balanceTotal[0]?.balance || 0;
        res.render("contents/Budget.ejs", { user_details, balance });

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
        const [balanceTotal] = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
            FROM transactions 
            WHERE user_id = ?`,
            [user_id]
        );
        const balance = balanceTotal[0]?.balance || 0;
        res.render("contents/viewbud.ejs", {
            user_details,
            budgets,
            balance
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

        const [budgets] = await pool.query(
            "SELECT budget_id, budget_name FROM budgets WHERE user_id = ?",
            [user_id]
        );
        const [balanceTotal] = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
            FROM transactions 
            WHERE user_id = ?`,
            [user_id]
        );
        const balance = balanceTotal[0]?.balance || 0;
        res.render("contents/themchitieu.ejs", {
            user_details, budgets, balance
        });

    } catch (err) {
        console.error("Lỗi khi tải trang:", err);
        res.status(500).send("Lỗi server khi tải trang");
    }
};

export const handlethemchitieu = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect("/");

        const user_id = req.session.user.id;
        const { transaction_name, amount, date, note, type, budget_id } = req.body;

        const [budgets] = await pool.query(
            "SELECT budget_id, budget_name FROM budgets WHERE user_id = ?", [user_id]
        );

        if (budgets.length === 0) {
            return res.status(400).send("<script>alert('Vui lòng tạo hạng mục ngân sách trước!'); window.history.back();</script>");
        }

        await pool.query(
            "INSERT INTO transactions (transaction_name, amount, date, note, user_id, type, budget_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [transaction_name, amount, date, note, user_id, type, budget_id || null]
        );

        res.redirect("/trang_chu/chinhsuachitieu");
    } catch (err) {
        console.error("Lỗi khi thêm chi tiêu:", err);
        res.status(500).send("Lỗi server khi thêm chi tiêu");
    }
};

export const chinhsuachitieuPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }

        const user_id = req.session.user.id;

        // Thông tin user
        const [userDetails] = await pool.query(
            "SELECT username, email FROM user WHERE id = ?",
            [user_id]
        );

        // Tính tổng số dư
        const [balanceTotal] = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
            FROM transactions 
            WHERE user_id = ?`,
            [user_id]
        );
        const balance = balanceTotal[0]?.balance || 0;
        // Danh sách giao dịch
        const [transactions] = await pool.query(
            "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
            [user_id]
        );

        const user_details = userDetails[0];


        res.render("contents/chinhsuachitieu.ejs", {
            user_details,
            balance,
            transactions
        });

    } catch (err) {
        console.error("Lỗi khi load trang chỉnh sửa chi tiêu:", err);
        res.status(500).send("Lỗi server khi tải trang chỉnh sửa chi tiêu");
    }
};

export const chinhsuakhoanchi = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect("/");

        const user_id = req.session.user.id;
        const { transaction_id, transaction_name, amount, date, note, type } = req.body;

        if (!transaction_id || !transaction_name || !amount || !date || !type) {
            return res.status(400).send("<script>alert('Vui lòng nhập đầy đủ thông tin!'); window.history.back();</script>");
        }

        const [checkTrans] = await pool.query(
            "SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?",
            [transaction_id, user_id]
        );

        if (checkTrans.length === 0) {
            return res.status(404).send("<script>alert('Không tìm thấy giao dịch!'); window.history.back();</script>");
        }


        await pool.query(
            `UPDATE transactions 
             SET transaction_name = ?, amount = ?, date = ?, note = ?, type = ?
             WHERE transaction_id = ? AND user_id = ?`,
            [transaction_name, amount, date, note, type, transaction_id, user_id]
        );

        res.redirect("/trang_chu/chinhsuachitieu");
    } catch (err) {
        console.error("Lỗi khi chỉnh sửa chi tiêu:", err);
        res.status(500).send("Lỗi server khi chỉnh sửa chi tiêu");
    }
};

export const xoakhoanchi = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect("/");

        const user_id = req.session.user.id;
        const { transaction_id } = req.body;

        if (!transaction_id) {
            return res.status(400).send("<script>alert('Thiếu ID giao dịch!'); window.history.back();</script>");
        }

        const [checkTrans] = await pool.query(
            "SELECT * FROM transactions WHERE transaction_id = ? AND user_id = ?",
            [transaction_id, user_id]
        );

        if (checkTrans.length === 0) {
            return res.status(404).send("<script>alert('Không tìm thấy giao dịch!'); window.history.back();</script>");
        }

        await pool.query(
            "DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?",
            [transaction_id, user_id]
        );

        res.redirect("/trang_chu/chinhsuachitieu");
    } catch (err) {
        console.error("Lỗi khi xoá chi tiêu:", err);
        res.status(500).send("Lỗi server khi xoá chi tiêu");
    }
};

export const chartsPage = async (req, res) => {
    try {
        if (!req.session.user) res.redirect("/");
        // Lấy thông tin user
        const user_id = req.session.user.id;

        const [userDetails] = await pool.query(
            "SELECT username, email FROM user WHERE id = ?", [user_id]);

        const [balanceTotal] = await pool.query(
            `SELECT 
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
             FROM transactions 
             WHERE user_id = ?`, [user_id]);

        const user_details = userDetails[0];
        const balance = balanceTotal[0].balance || 0;

        const [rows] = await pool.query(
            `SELECT 
             QUARTER(date) AS quy,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
             FROM transactions
             WHERE user_id = ?
             AND YEAR(date) = YEAR(CURDATE())
             GROUP BY quy
             ORDER BY quy`, [user_id]);

        const [pieChart] = await pool.query(
            `SELECT 
            b.budget_name AS ten_hang_muc,
            SUM(t.amount) AS tong_chi
            FROM transactions t
            JOIN budgets b ON t.budget_id = b.budget_id
            WHERE t.type = 'expense'
            AND t.user_id = ?
            AND YEAR(t.date) = YEAR(CURDATE())
            GROUP BY b.budget_name`, [user_id]);

        const currentYear = new Date().getFullYear();
        const tongChitieu = rows;
        const pieData = pieChart;

        res.render("contents/Charts.ejs", {
            user_details,
            balance,
            tongChitieu,
            pieData,
            currentYear
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi lấy dữ liệu biểu đồ");
    }
};

export const historyPage = async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const userId = req.session.user.id;

    const { fromDate, toDate, type } = req.method === 'POST' ? req.body : {};

    let sql = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [userId];

    if (fromDate) {
        sql += " AND date >= ?";
        params.push(fromDate);
    }
    if (toDate) {
        sql += " AND date <= ?";
        params.push(toDate);
    }
    if (type && type !== 'all') {
        sql += " AND type = ?";
        params.push(type);
    }

    try {
        const [transactions] = await pool.query(sql, params);

        let total_income = 0, total_expense = 0;
        transactions.forEach(t => {
            const amt = Number(t.amount);
            if (t.type === 'income') total_income += amt;
            else if (t.type === 'expense') total_expense += amt;
        });

        res.render("contents/History.ejs", {
            user_details: req.session.user,
            transactions,
            total_income,
            total_expense,
            balance: total_income - total_expense,
            fromDate: fromDate || '',
            toDate: toDate || '',
            type: type || 'all'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
};

export const exportFile = async (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const userId = req.session.user.id;
    const { fromDate, toDate, type } = req.query;

    let sql = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [userId];

    if (fromDate) { sql += " AND date >= ?"; params.push(fromDate); }
    if (toDate) { sql += " AND date <= ?"; params.push(toDate); }
    if (type && type !== "all") { sql += " AND type = ?"; params.push(type); }

    const [transactions] = await pool.query(sql, params);

    // Làm phẳng dữ liệu trước khi export (đề phòng object con)
    const flatData = transactions.map(t => {
        const obj = {};
        for (const key in t) {
            const value = t[key];
            if (typeof value === "object" && value !== null) {
                obj[key] = JSON.stringify(value); // Chuyển object → chuỗi
            } else {
                obj[key] = value;
            }
        }
        return obj;
    });

    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const csv = generateCsv(csvConfig)(flatData);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="lich-su-giao-dich.csv"');
    res.send(asString(csv));
};

export const notification = async (req, res) => {
    if (!req.session.user) return res.redirect("/");
    const userId = req.session.user.id;

    const [rows] = await pool.query(
        `SELECT transaction_name, amount, type, date
     FROM transactions
     WHERE user_id = ?
     ORDER BY date DESC
     LIMIT 5`,
        [userId]
    );

    if (rows.length === 0) {
        return res.json({ notifyList: [] });
    }

    const notifyList = rows.map(t => ({
        message: `Bạn ${t.type === 'income' ? 'nhận' : 'chi'} ${t.amount.toLocaleString('vi-VN')
            }₫ cho "${t.transaction_name}" vào ${new Date(t.date).toLocaleString('vi-VN')}.`
    }));

    res.json({ notifyList });
};
