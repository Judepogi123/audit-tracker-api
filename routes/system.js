import express from "express";

import { database,get,ref } from "../firebase/dbConfig.js";

const router = express.Router();

router.get("/system", async (req, res) => {
  try {
    const systemDataPath = ref(database, "System/auditInfo");
    const systemDataSnapshot = await get(systemDataPath);
    if (systemDataSnapshot.val()) {
      const data = systemDataSnapshot.val();
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No system data found!" });
    }
  } catch (error) {
    res.status(500).json(`${error}`)
  }
    
});

export default router