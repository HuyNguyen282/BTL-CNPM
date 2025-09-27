import express from 'express';
import configViewEngine from './config/viewEngine.js';
import dotenv from 'dotenv';
import initWebRoute from './route/web.js';
dotenv.config()
const app = express();
const port = process.env.PORT || 8080;

configViewEngine(app);
initWebRoute(app);

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
