import { Router } from "express";
import AddData from "../contollers/adddata.js";
import ValidateData from "../middlewares/validateData.js";
import ValidateCageId from "../middlewares/validateid.js";
const router = Router()


router.get("/", (req,res)=>{
    res.status(200).send("coming soon...")
})

// Check Cage Validity
router.post("/data",ValidateData,ValidateCageId, AddData);

export default router;