import express from "express";
import { getHomePage, aboutPage } from "../controllers/homeController.js";

const router = express.Router();

const initWebRoute = (app) => {
    router.get("/", getHomePage);
    router.get("/about", aboutPage);
    return app.use("/", router);
};

export default initWebRoute;
