import pkg from 'pg';
const { Pool } = pkg;

import dotenv from "dotenv"
dotenv.config()

export const client = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

client.connect(function (error) {
    if (error) throw error
    console.log("connected...")
})