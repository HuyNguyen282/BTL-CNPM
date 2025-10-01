import express from "express";
import {
    getHomePage,
    aboutPage,
    getDetailPage,
    signUpPage,
    handleSignUp,
    handleDelete,
    loginPage,
    handleLogin
} from "../controllers/homeController.js";

const router = express.Router();

const initWebRoute = (app) => {
    router.get("/", getHomePage);
    router.get("/about", aboutPage);

    router.get("/users/detail/:username", getDetailPage);
    router.post("/users/delete/:email", handleDelete);

    router.get("/login", loginPage)
    router.post("/login", handleLogin);

    router.get("/signup", signUpPage);
    router.post("/signup", handleSignUp);

    return app.use("/", router);
};

export default initWebRoute;
