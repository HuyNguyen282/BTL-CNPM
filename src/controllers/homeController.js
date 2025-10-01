import pool from "../config/connectDB.js";
import bcrypt from "bcrypt";

export const getHomePage = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM users");
    return res.render("index.ejs", { data: rows });
};

export const aboutPage = (req, res) => {
    return res.render("about.ejs");
};

export const getDetailPage = async (req, res) => {
    const { username } = req.params;
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) return res.status(404).send("User không tồn tại");

    return res.render("user.ejs", { data: rows[0] });
};

export const signUpPage = (req, res) => {
    return res.render("newUser.ejs");
};

export const handleSignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        return res.redirect("/");
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("Email hoặc username đã tồn tại!");
        }
        return res.status(500).send("Lỗi server khi đăng ký");
    }
};

export const loginPage = (req, res) => {
    return res.render("login.ejs");
};

export const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) return res.status(400).send("⚠️ Người dùng không tồn tại");

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send("⚠️ Sai mật khẩu");

        return res.render("user.ejs", { data: user });
    } catch (err) {
        console.error("❌ Lỗi login:", err);
        return res.status(500).send("Lỗi server khi login");
    }
};

export const handleDelete = async (req, res) => {
    try {
        const { email } = req.params; // nếu route là /users/delete/:email

        const [result] = await pool.query("DELETE FROM users WHERE email = ?", [email]);

        if (result.affectedRows === 0) return res.status(404).send("❌ User không tồn tại");

        return res.redirect("/");
    } catch (err) {
        console.error("❌ Lỗi khi xoá user:", err);
        return res.status(500).send("Lỗi server khi xoá user");
    }
};


