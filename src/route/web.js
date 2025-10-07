import express from "express";
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
    mainPage,
    handleLogout,
    loadContent
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

    router.get("/trangchu", checkLogin, mainPage);

    router.get("/content/:page", checkLogin, loadContent);

    return app.use("/", router);
};

export default initWebRoute;
