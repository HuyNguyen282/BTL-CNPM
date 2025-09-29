import express from "express";
import { getDetailPage, getHomePage, aboutPage } from "../controllers/homeController.js";

const router = express.Router();

const initWebRoute = (app) => {
    router.get("/", getHomePage);
    router.get("/about", aboutPage);
    router.get("/users/detail/:username", getDetailPage)
    return app.use("/", router);
};

export default initWebRoute;
