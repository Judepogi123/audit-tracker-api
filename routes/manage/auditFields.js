import express from "express";

import { database } from "../../firebase/dbConfig.js";
import { get, ref } from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/audit-fields", async (req, res) => {
  try {
    const fieldRef = ref(database, `System/auditInfo/fields`);
    const snapshot = await get(fieldRef);
    if (snapshot.val()) {
      const data = snapshot.val()
      res.status(200).json(Object.values(data));
    } else {
      res.status(200).json({ message: "empty" });
    }
  } catch (error) {
    res.status(500).json({ message: `Sorry, something went wrong, ${error}` });
  }
});

export default router;
