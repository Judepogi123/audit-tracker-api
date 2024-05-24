import express from "express";
import { firestore } from "../../firebase/dbConfig.js";
import { getDoc, doc } from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/user-info?:username", async (req, res) => {
  try {
    const request = req.params;
    if (!request.username) return;
    const userDoc = doc(firestore, "user_data", request.username);
    const snapshot = await getDoc(userDoc);
    if (snapshot.exists()) {
      const data = snapshot.data();
      res.status(200).json({ ...data });
    } else {
      res.status(404).json({ message: "User not found", status: "error" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Server error: ${error}`, status: "error" });
  }
});

export default router;
