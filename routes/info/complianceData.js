import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { get, ref } from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/compliance-data", async (req, res) => {
  try {
    const { zipCode, pushKey } = req.query;
    const dataRef = ref(database, `Compliance/${zipCode}/${pushKey}`);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      res.status(200).json({...data});
    } else {
      res.status(404).json({ message: "Item not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}`, status: "error" });
  }
});

export default router;
