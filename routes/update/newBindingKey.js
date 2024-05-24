import express from "express";

import { database, get, ref, set } from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/new-binding-Key", async (req, res) => {
  const request = req.body;
  console.log(request);
  try {
    if (request.key && request.genKey) {
      await set(
        ref(
          database,
          `System/auditInfo/auditKeys/${request.genKey + "-" + request.key + "-" +request.type}`
        ),
        {
          key: `${request.genKey + "-" + request.key + "-" +request.type}`,
          bindedKey: `${request.key}`.toLowerCase(),
          timestamp: request.date,
          binded: false,
        }
      );
      res.status(200).json({message: "Success!"})
    }else{
        res.status(404).json({message: "Request data error"})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router;
