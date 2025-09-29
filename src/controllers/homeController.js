import pool from "../config/connectDB.js";

export const getHomePage = (req, res) => {
    pool.query("SELECT * FROM users", (err, results, fields) => {
        if (err) {
            console.error("Lỗi DB:", err.message);
            return res.status(500).send("DB error");
        }

        console.log(results);

        return res.render("index.ejs", {
            data: results
        });

    });
};

export const aboutPage = (req, res) => {
    return res.render("about.ejs");
};
