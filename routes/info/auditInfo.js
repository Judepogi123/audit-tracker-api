import express from "express";
import { database, ref, get } from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/audit-info", async (req, res) => {
  const request = req.query;
  try {
    const dataRef = ref(
      database,
      `System/auditInfo/auditList/${request.auditID}`
    );
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      res.status(200).json({ ...data });
    } else {
      res.status(404).json({ message: "Item not found." });
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router;
