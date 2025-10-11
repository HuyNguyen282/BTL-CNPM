import express from "express";
import pool from "../config/connectDB.js";
import { checkLogin } from "../middleware/checkLogin.js";
import {
    getHomePage,
    signUpPage,
    handleSignUp,
    handleLogin,
    forgotPasswordPage,
    handleResetPasswordRequest,
    enterMailPage,
    handleSendMail,
    handleLogout,
    trang_chu,
    budgetPage,
    viewbudPage,
    themchitieuPage,
    chinhsuachitieuPage
} from "../controllers/homeController.js";

const router = express.Router();

const initWebRoute = (app) => {
    router.get("/", getHomePage);
    router.post("/", handleLogin);

    router.get("/logout", handleLogout);

    router.get("/signup", signUpPage);
    router.post("/signup", handleSignUp);

    router.get("/enter", enterMailPage);
    router.post("/enter", handleSendMail);

    router.get("/forgot", forgotPasswordPage);
    router.post("/forgot", handleResetPasswordRequest);

    router.get("/trang_chu/dashboard", checkLogin, trang_chu);
    router.get("/trang_chu/budget", checkLogin, budgetPage);
    router.get("/trang_chu/viewbud", checkLogin, viewbudPage);
    router.get("/trang_chu/themchitieu", checkLogin, themchitieuPage);
    router.get("/trang_chu/chinhsuakhoanchi", checkLogin, chinhsuachitieuPage);

    return app.use("/", router);
};

export default initWebRoute;
