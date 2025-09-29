import pool from "../config/connectDB.js";

const getHomePage = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM users");
    return res.render("index.ejs", { data: rows });
};

const aboutPage = async (req, res) => {
    return await res.render("about.ejs");
};

let getDetailPage = async (req, res) => {
    let id = req.params.username;
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [id]

    );
    return await res.render("user.ejs", { data: rows[0] });

};
module.exports = {
    getHomePage,
    aboutPage,
    getDetailPage
}