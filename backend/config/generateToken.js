import jwt from "jsonwebtoken"
import { redisClient } from "../index.js";
import { nullable } from "zod";
import { id } from "zod/v4/locales";
import { generatecsrfToken, revokecsrfToken } from "./csrfMiddleware.js";

export const generateToken = async (id, resp) => {

    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    })

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    })

    const refreshTokenKey = `refresh_token:${id}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

    //store cookie
    resp.cookie("accessToken", accessToken, {
        //only backend read
        httpOnly: true,
        //https work only not work http
        secure: true,
        //cors error csrf attack not cross site rqust farjary none becuase use cors to fron our backend diff used create csrf token
        sameSite: "none",
        maxAge: 15 * 60 * 1000,

    })
    resp.cookie("refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });

    const csrfToken = await generatecsrfToken(id, resp)
    return { accessToken, refreshToken, csrfToken };
};
//verify refrsh-token
export const verifyRefreshToken = async (refreshToken) => {
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const storedToken = await redisClient.get(`refresh_token:${decode.id}`);
        //match refresh-token in redis token
        if (storedToken === refreshToken) {
            return decode
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const generateAccessToken = (id, resp) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });

    resp.cookie("accessToken", accessToken, {
        //only backend read
        httpOnly: true,
        //https work only not work http
        secure: true,
        //cors error csrf attack not cross site rqust farjary none becuase use cors to fron our backend diff used create csrf token
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
    });
}

export const revokeRefreshToken = async (userId) => {
    await redisClient.del(`refresh_token:${userId}`);
    await revokecsrfToken(userId);
}

// Login/Register
//       ↓
// generateToken()
//       ↓
// Access + Refresh + CSRF cookies
//       ↓
// Protected API call
//       ↓
// Access valid? → YES → Allow
//       ↓
// NO (expired)
//       ↓
// verifyRefreshToken()
//       ↓
// Valid? → YES → generateAccessToken()
//       ↓
// New Access Token
//       ↓
// Continue API calls
//       ↓
// Logout → revokeRefreshToken()
//       ↓
// Redis token deleted → Session dead
