import express from "express";

import { database } from "../../../firebase/dbConfig.js";
import { get, set, ref } from "../../../firebase/dbConfig.js";

const router = express.Router();

router.get(`/indicator-info`, async (req, res) => {
  try {
    const indicatorRef = ref(database, `System/auditInfo/fields`);
    const snapshot = await get(indicatorRef)
    if(snapshot.exists()){
        
    }else{
        res.status(404).json({ message: `Not found!`, status: "error" })
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Server error: ${error}`, status: "error" });
  }
});

export default router;
