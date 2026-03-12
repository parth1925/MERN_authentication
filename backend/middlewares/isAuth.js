//Production Authentication Middleware Flow
import jwt from "jsonwebtoken"
import { redisClient } from "../index.js";
import { User } from "../models/User.js";

export const isAuth = async (req, resp, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return resp.status(403).json({
                message: "Please Login -noToken",
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedData) {
            return resp.status(400).json({
                message: "token expired",
            });
        }

        //many times not fatch the data in db becuse load the db that redis inside fatch the user
        //save data to user id
        const cacheUser = await redisClient.get(`user:${decodedData.id}`);
        if (cacheUser) {
            req.user = JSON.parse(cacheUser);
            return next();
        }

        const user = await User.findById(decodedData.id).select("-password");
        if (!user) {
            return resp.status(400).json({
                message: "no user this id",
            })
        }

        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

        req.user = user;
        next();
    } catch (error) {
        resp.status(500).json({
            message: error.message,
        })
    }
}

export const authorizedAdmin = async (req, resp, next) => {
    const user = req.user;
    if (user.role != "admin") {
        return resp.status(401).json({
            message: "You are not Allowed for this activity"
        })
    }
    next()
}