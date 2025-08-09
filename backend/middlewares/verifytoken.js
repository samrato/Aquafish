import { auth } from "../lib/firebase.js";

export default async function VerifyFirebaseToken(req, res, next){
    try {
        console.log(req.headers.authorization);
        const token = req.headers.authorization?.split(" ")[1]; 
    
        if (!token) {
          return res.status(401).json({ error: "Unauthorized: No token provided" });
        }
    
        const decodedToken = await auth().verifyIdToken(token); 
        req.user = decodedToken; 
        next();
      } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
    
}