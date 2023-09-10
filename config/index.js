import dotenv from "dotenv"
dotenv.config()

const ENV = {
    // database
    // MONGO_URL: process.env.MONGODB_URI,
    SECRET_KEY: process.env.SECRET_KEY,
}

export default ENV
