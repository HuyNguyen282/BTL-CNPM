import express from 'express';
import configViewEngine from './config/viewEngine';
import dotenv from 'dotenv';
dotenv.config()
const app = express();
const port = process.env.PORT || 8080;
configViewEngine(app);
app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
