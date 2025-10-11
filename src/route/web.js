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
    handlebudgetPage,
    viewbudPage,
    themchitieuPage,
    chinhsuachitieuPage,
    updateBudget,
    deleteBudget
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
    router.post("/trang_chu/Budget", checkLogin, handlebudgetPage);

    router.get("/trang_chu/viewbud", checkLogin, viewbudPage);
    router.post("/trang_chu/viewbud/chinhsua", checkLogin, updateBudget);
    router.post("/trang_chu/viewbud/xoa", checkLogin, deleteBudget);

    router.get("/trang_chu/themchitieu", checkLogin, themchitieuPage);
    router.get("/trang_chu/chinhsuakhoanchi", checkLogin, chinhsuachitieuPage);

    router.get('/api/budgets', checkLogin, async (req, res) => {
        try {
            const userId = req.session.user.id;

            const [budgets] = await pool.query(
                "SELECT * FROM budgets WHERE user_id = ? AND is_deleted = 0 ORDER BY start_date DESC",
                [userId]
            );

            res.status(200).json(budgets);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu budgets:", error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    });



    return app.use("/", router);
};

export default initWebRoute;
