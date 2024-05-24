import express from "express";
import { database } from "../../../firebase/dbConfig.js";
import { get, ref } from "../../../firebase/dbConfig.js";
 
const router = express.Router();

router.get("/data", async (req, res) => {
  try {
    const systemPath = ref(database, "System/auditInfo");
    const snapshot = await get(systemPath);
    if (snapshot.val()) {
      res.status(200).json(snapshot.val());
    } else {
      res
        .status(404)
        .json({ message: ` Sorry, something went wrong ${error}` });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Sorry, Internal error occured. ${error}` });
  }
});

export default router;
