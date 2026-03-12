import crypto from 'crypto'
import { redisClient } from '../index.js';

export const generatecsrfToken = async (userId, resp) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const csrfKey = `csrf:${userId}`;

    await redisClient.setEx(csrfKey, 3600, csrfToken);

    resp.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
    });

    return csrfToken;
};

export const VerifycsrfToken = async (req, resp, next) => {
    try {
        //skip get req
        if (req.method === "GET") {
            return next()
        }
        //user Authenticated
        const userId = req.user?._id;
        if (!userId) {
            return resp.status(401).json({
                message: "User Not Aunthenticated",
            })
        }

        //csrfToken get in frontend 3 frontend header get token
        const clientToken = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"] || req.headers["csrf-token"];
        if (!clientToken) {
            return resp.status(403).json({
                message: "csrf Token Missing.please refresh page.",
                code: "CSRF_TOKEN_MISSING",
            })
        }
        //get redis store token
        const csrfKey = `csrf:${userId}`;

        const storedToken = await redisClient.get(csrfKey);
        if (!storedToken) {
            return resp.status(403).json({
                message: "csrf Token Expired.please try again.",
                code: "CSRF_TOKEN_EXPIRED",
            })
        }
        if (storedToken !== clientToken) {
            return resp.status(403).json({
                message: "Invalid csrf Token.please refresh page.",
                code: "CSRF_TOKEN_INVALID",
            })
        };

        next();
    } catch (error) {
        console.log("CSRF verification error:", error);
        return resp.status(500).json({
            message: "csrf verification faild.",
            code: "CSRF_VERIFICATION_ERROR",
        })
    }
}

export const revokecsrfToken = async (userId) => {
    const csrfKey = `csrf:${userId}`;

    await redisClient.del(csrfKey);
}

export const refreshcsrfToken = async (userId, resp) => {
    await revokecsrfToken(userId)

    return await generatecsrfToken(userId, resp);
}

// Login
//   ↓
// Generate CSRF Token
//   ↓
// Store in Redis
//   ↓
// Send Cookie to Browser
//   ↓
// Frontend sends token in header
//   ↓
// Middleware checks Redis
//   ↓
// Match ? → Allow : Reject