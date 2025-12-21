import { Router } from "express";
import AuthMiddleware from "../middleware/auth.js";
import { getProfile, inviteUser, listCompanyUsers, loginUser, registerAdmin, resendOtp, verifyOtp, listRelatedUsers, updateUserSiteAccess, forgotPassword, resetPassword } from "../controllers/UserController.js";

const userRouter = Router();

userRouter.post("/auth/register", registerAdmin);
userRouter.post("/auth/verify-otp", verifyOtp);
userRouter.post("/auth/resend-otp", resendOtp);
userRouter.post("/auth/login", loginUser);
userRouter.post("/auth/forgot-password", forgotPassword);
userRouter.post("/auth/reset-password", resetPassword);
userRouter.get("/auth/me", AuthMiddleware, getProfile);
userRouter.get("/users", AuthMiddleware, listCompanyUsers);
userRouter.get("/users/related", AuthMiddleware, listRelatedUsers);
userRouter.post("/users/invite", AuthMiddleware, inviteUser);
userRouter.put("/users/:userId/site-access", AuthMiddleware, updateUserSiteAccess);

export default userRouter;