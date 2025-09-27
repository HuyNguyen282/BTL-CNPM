import express from "express";
import * as homeController from "../controller/homeController.js";  // ✅

let router = express.Router();

const initWebRoute = (app) => {
    router.get('/', homeController.getHomePage);

    router.get('/about', homeController.aboutPage);

    return app.use('/', router);
};

export default initWebRoute;
