import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import UserRoutes from "./routes/users.js";
import IoTRoutes from "./routes/iot.js"
const api = "/api/v1"
const app = express();
app.use(json());
app.use(cors());
const port = process.env.PORT
app.get("/", (req, res)=>{
    return res.send("Hello Aqua");
});

app.use(`${api}/users`, UserRoutes);
app.use(`${api}/iot`, IoTRoutes);

app.listen(port, () => {
    console.log(`app listening on  http://localhost:${port}`)
  });