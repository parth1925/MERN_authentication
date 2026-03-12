import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js ";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config()

await connectDb();
//connection in redis 
const redisUrl = process.env.REDIS_URL
if (!redisUrl) {
    console.log("Missing Redis");
    process.exit(1);
}

export const redisClient = createClient({
    url: redisUrl,
})

redisClient.connect().then(() => console.log(`Redis Connected`)).catch(console.error);

const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());
//cokies read that can use option
app.use(cors({
    origin: process.env.FRONTEND_URL,
    //backend ka credetial read frontend acctoken refrtoken fronted taird
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}))

//importing user routes
import userRoutes from "./routes/user.js ";

//using routes
app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`);
})