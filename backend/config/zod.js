import {z} from "zod"

export const registerSchema = z.object({
    name:z.string().min(3,"enter Name Must be 3 Character"),
    email:z.string().email("invalid Email id"),
    password:z.string().min(8,"Eneter Must be 8 Character Password")
});

export const loginSchema = z.object({
    email:z.string().email("invalid Email id"),
    password:z.string().min(8,"Eneter Must be 8 Character Password")
});

