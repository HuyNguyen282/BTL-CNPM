import express from "express";
import {
    getHomePage,
    aboutPage,
    getDetailPage,
    signUpPage,
    handleSignUp,
    handleDelete,
    loginPage,
    handleLogin,
    forgotPasswordPage,
    handleResetPasswordRequest,
    enterMailPage,
    handleSendMail
} from "../controllers/homeController.js";

const router = express.Router();

const initWebRoute = (app) => {
    router.get("/", getHomePage);

    router.get("/login", loginPage)
    router.post("/login", handleLogin);

    router.get("/signup", signUpPage);
    router.post("/signup", handleSignUp);

    router.get("/enter", enterMailPage);
    router.post("/enter", handleSendMail);

    router.get("/forgot", forgotPasswordPage);
    router.post("/forgot", handleResetPasswordRequest);



    return app.use("/", router);
};

export default initWebRoute;
