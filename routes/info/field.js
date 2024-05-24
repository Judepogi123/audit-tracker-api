import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { get, ref } from "firebase/database";

const router = express.Router();

router.get("/field-info", async (req, res) => {
  try {
    const id = req.query.pushKey; // Access id from query parameters
    if (!id) {
      return res.status(400).json({ message: "ID parameter missing" });
    }

    const fieldPath = ref(database, `System/auditInfo/fields/${id}`);
    const fieldSnapshot = await get(fieldPath);

    if (fieldSnapshot.exists()) {
      const data = fieldSnapshot.val();
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "Field not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
