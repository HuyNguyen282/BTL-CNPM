import express from "express";
import session from "express-session";
import configViewEngine from "./config/viewEngine.js";
import initWebRoute from "./route/web.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(express.static("src/public"));
app.use(session({
    secret: "15112006",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



configViewEngine(app);
initWebRoute(app);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
})
