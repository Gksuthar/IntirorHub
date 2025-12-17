import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/UserRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", userRouter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
