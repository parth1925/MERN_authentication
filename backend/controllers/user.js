import { loginSchema, registerSchema } from "../config/zod.js";
import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import { redisClient } from "../index.js";
import { User } from "../models/User.js";
import crypto from "crypto"
import bcrypt from "bcrypt"
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { json } from "stream/consumers";
import { userInfo } from "os";
import { email } from "zod";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefreshToken } from "../config/generateToken.js";
import { generatecsrfToken } from "../config/csrfMiddleware.js";

export const registerUser = TryCatch(async (req, resp) => {
    //sanitized body protect in sqli injection
    const sanitizedBody = sanitize(req.body);

    //validation 
    const validation = registerSchema.safeParse(sanitizedBody)

    const zoderror = validation.error;

    let firstError = "validation failed";
    let allError = [];
    if (zoderror?.issues && Array.isArray(zoderror.issues)) {
        allError = zoderror.issues.map((issue) => ({
            field: issue.path ? issue.path.join(".") : "unknown",
            message: issue.message || "validation Error",
            code: issue.code
        }))
    }

    firstError = allError[0]?.message || "validation Error";

    if (!validation.success) {
        return resp.status(400).json({
            message: firstError,
            error: allError
        });
    }
    //not error in form then data are show
    const { name, email, password } = validation.data;

    //used rate-limit 
    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

    //check condition redisclient inside show rate-limit
    if (await redisClient.get(rateLimitKey)) {
        return resp.status(429).json({
            message: "too many Request,Try After Some Time",
        });
    }
    //existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return resp.status(400).json({
            message: "User Already exist",
        });
    }

    //password hashing using in bcrypt
    const hashPassword = await bcrypt.hash(password, 10);

    //ganerate varifytoken use crypto randomytes to secure token
    const verifyToken = crypto.randomBytes(32).toString("hex");

    //ganerate varifykey 
    const verifyKey = `varify:${verifyToken}`

    //data to store in redis
    const dataTostore = JSON.stringify({
        name,
        email,
        password: hashPassword
    })

    //5 min to store to redis
    await redisClient.set(verifyKey, dataTostore, { EX: 300 })

    //subject send to mail
    const subject = "verify your email for Account Creation"

    //html set 
    const html = getVerifyEmailHtml({ email, token: verifyToken });

    //send mail
    await sendMail({ email, subject, html })

    //set rate limit-key 
    await redisClient.set(rateLimitKey, "true", { EX: 60 })

    resp.json({
        message: "if your email is valid ,Create Account verifiction link has been send , link are expire in 5 min"
    });
});

export const verifyUser = TryCatch(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({
            message: "verification Token Required",
        });
    }

    const verifyKey = `varify:${token}`;

    const userDataJson = await redisClient.get(verifyKey)
    if (!userDataJson) {
        return res.status(400).json({
            message: "Verification Link Is Expired",
        });
    }

    await redisClient.del(verifyKey)

    const UserData = JSON.parse(userDataJson);

    // existing user
    // const existingUser = await User.findOne({ email: UserData.email });
    // if (existingUser) {
    //     return res.status(400).json({
    //         message: "User Already exist",
    //     });
    // }

    //create user 
    const newUser = await User.create({
        name: UserData.name,
        email: UserData.email,
        password: UserData.password,
    })

    res.status(201).json({
        message: "Email Verified Successfully! your Account has been Created",
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
    });
});

export const loginUser = TryCatch(async (req, resp) => {

    //sanitized body protect in sqli injection
    const sanitizedBody = sanitize(req.body);

    //validation 
    const validation = loginSchema.safeParse(sanitizedBody)

    const zoderror = validation.error;

    let firstError = "validation failed";
    let allError = [];
    if (zoderror?.issues && Array.isArray(zoderror.issues)) {
        allError = zoderror.issues.map((issue) => ({
            field: issue.path ? issue.path.join(".") : "unknown",
            message: issue.message || "validation Error",
            code: issue.code
        }))
    }

    firstError = allError[0]?.message || "validation Error";

    if (!validation.success) {
        return resp.status(400).json({
            message: firstError,
            error: allError
        });
    }
    //not error in form then data are show
    const { email, password } = validation.data;

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;

    //check condition redisclient inside used rate-limit
    if (await redisClient.get(rateLimitKey)) {
        return resp.status(429).json({
            message: "too many Request,Try After Some Time",
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return resp.status(400).json({
            message: "invalid credentials",
        });
    }

    const comparepass = await bcrypt.compare(password, user.password);
    if (!comparepass) {
        return resp.status(400).json({
            message: "invalid credentails"
        });
    }

    //create otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;

    await redisClient.set(otpKey, JSON.stringify(otp), { EX: 300 });

    const subject = "otp for verification";

    const html = getOtpHtml({ email, otp });

    await sendMail({ email, subject, html })

    await redisClient.set(rateLimitKey, "true", { EX: 60 });

    resp.json({
        message: "otp sent successfully , please Enter otp to send Email"
    })
});

export const verifyotp = TryCatch(async (req, resp) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return resp.status(400).json({
            message: "please provide all details",
        })
    }

    const otpKey = `otp:${email}`;

    const storeOtpString = await redisClient.get(otpKey);

    if (!storeOtpString) {
        return resp.status(400).json({
            messsage: "otp expired",
        })
    }

    const storedOtp = JSON.parse(storeOtpString);
    if (storedOtp !== otp) {
        return resp.status(400).json({
            message: "invalid otp",
        })
    }


    await redisClient.del(otpKey);

    let user = await User.findOne({ email });

    //token
    const tokenData = await generateToken(user._id, resp);

    resp.status(200).json({
        message: `Welcome ${user.name}`,
        user,
    });
});

//this one api create to fetch the user authetication request
export const myProfile = TryCatch(async (req, resp) => {
    const user = req.user;

 
    resp.json(user);
})

//generate Accesss Token help to refresh_token
export const refreshToken = TryCatch(async (req, resp) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return resp.status(401).json({
            message: "invalid refrsh token",
        });
    }

    const decode = await verifyRefreshToken(refreshToken)
    if (!decode) {
        return resp.status(401).json({
            message: "Invalid refresh token",
        });
    }

    generateAccessToken(decode.id ,resp);

    resp.status(200).json({
        message: "token refreshed"
    })

})

export const logoutUser = TryCatch(async (req, resp) => {
    const userId = req.user._id;

    await revokeRefreshToken(userId);

    resp.clearCookie("refreshToken");
    resp.clearCookie("accessToken");
    resp.clearCookie("csrfToken");

    await redisClient.del(`user:${userId}`);

    resp.json({
        message: "logout successfully",
    })

})

export const refreshCSRF = TryCatch(async (req, resp) => {
    const userId = req.user._id

    const newCSRFTOKEN = await generatecsrfToken(userId, resp)

    resp.json({
        message: "CSRf token Refreshed Successfully..",
        csrfToken: newCSRFTOKEN,
    })
})

export const adminController = TryCatch(async (req, resp) => {
    resp.json({
        message: "Hello Admin",
    })
})