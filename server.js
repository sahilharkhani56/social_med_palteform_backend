import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from 'dotenv';
import router from "./Router/Route.js";
dotenv.config()
const app = express();
const PORT = process.env.PORT||8080;
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.get('/',(req,res)=>{
    res.status(201).json('Home get Request')
})
app.use("/api", router);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});