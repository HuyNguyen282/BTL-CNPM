import express from "express";
import configViewEngine from "./config/viewEngine.js";
import initWebRoute from "./route/web.js";
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

initWebRoute(app);

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});