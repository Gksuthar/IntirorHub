import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const AuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized, token missing" });
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET || "development-secret");

        const user = await User.findById(decode.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("AuthMiddleware error", error);
        return res.status(401).json({
            message: "Unauthorized, invalid or expired token",
        });
    }
}
export default AuthMiddleware;