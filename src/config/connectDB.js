import mysql from "mysql2";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "sonbg120",
    database: "a"
});
pool.query(
    "select *from `users`",
    function (err, results, fields) {
        console.log(results);
    }
)
export default pool;
