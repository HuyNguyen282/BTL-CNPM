import mysql from "mysql2";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "a",
});

export default pool.promise();
