import express from "express";
import { client } from "../database/index.js";
import { responseHandler } from "../helper/responseHelper.js";
import dotenv from "dotenv";
import { createToken } from "../utils/auth.js";

dotenv.config()

const router = express.Router();




router.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        const query = "SELECT * FROM public.users WHERE email = $1";

        const result = await client.query(query, [email]);
        if (result.rows.length > 0) {
            if (result.rows[0].password == password) {
                const resultModify = {
                    name: result.rows[0].name,
                    email: result.rows[0].email,
                    role: result.rows[0].role,
                    created_at: result.rows[0].created_at
                }
                const token = createToken({ id: result.rows[0].id, email: result.rows[0].email })
                return responseHandler(res, { data: resultModify, message: "successfully logged in", status: 2000, token: token });
            } else {
                return responseHandler(res, { data: [], message: "wrong password", status: 4004 });
            }
        } else {
            return responseHandler(res, { data: [], message: "email not found", status: 4004 });
        }
    } catch (error) {
        responseHandler(res, { data: error.message, message: "Error", status: 5000 });
        return
    }
});


export default router;