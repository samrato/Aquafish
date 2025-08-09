import { db } from "../lib/firebase.js";

export default async function ValidateCageId(req, res, next) {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Cage ID is required" });
        }

        // Fetch the cage document from Firestore
        const cageDoc = await db.collection("cages").doc(id).get();

        if (!cageDoc.exists) {
            return res.status(404).json({ error: "Cage not found" });
        }

        // Attach the cage data to the request object
        req.user = cageDoc.data().ownerId;

        next();
    } catch (error) {
        console.error("Error fetching cage:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
