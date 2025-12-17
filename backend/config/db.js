import mongoose from "mongoose";

const DBURL = process.env.MONGODB_URL || "mongodb+srv://rahul:rahul@cluster0.nv076.mongodb.net/IntHub?retryWrites=true&w=majority&appName=Cluster0"
const connectDB = async () => {
    try {
        if (!DBURL) {
            throw new Error("MONGODB_URL is not defined in environment variables");
        }
        await mongoose.connect(DBURL);
        console.log("✅ MongoDB connected successfully");

    } catch (error) {
        console.error(error.message)
        process.exit(1);
    }
}

export default connectDB