import { Router } from "express";
import { db } from "../lib/firebase.js";
import VerifyFirebaseToken from "../middlewares/verifytoken.js";

const router = Router()


router.get("/", (req,res)=>{
    res.status(200).send("coming soon...")
})

router.get("/users", VerifyFirebaseToken, async (req, res) => {
    try {
      const snapshot = await db.collection("users").get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default router