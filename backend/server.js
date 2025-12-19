import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/UserRoute.js";
import siteRouter from "./routes/SiteRoute.js";
import feedRouter from "./routes/FeedRoute.js";
import paymentRouter from "./routes/PaymentRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;


app.use(cors({
  origin: '*',
  credentials: true,
}))
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

connectDB();

app.use("/api", userRouter);
app.use("/api/sites", siteRouter);
app.use("/api/feed", feedRouter);
app.use("/api/payments", paymentRouter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
