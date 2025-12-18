import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();  
const DBURL = process.env.MONGODB_URL;
const connectDB = async () => {
    try {
        if (!DBURL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }
        await mongoose.connect(DBURL, {
      autoIndex: true,
    });
        console.log("✅ MongoDB connected successfully");

    } catch (error) {
        console.error(error.message)
        process.exit(1);
    }
}

export default connectDB