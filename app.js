import express from "express";
// router
import studentRouter from "./router/students.js";
import userRouter from "./router/users.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(cors());


app.get('/', async (req, res) => {
    res.send('Hello World!')
});

app.use("/student", studentRouter);
app.use("/user", userRouter);

app.listen(3001, () => {
    console.log('running server ....')
});