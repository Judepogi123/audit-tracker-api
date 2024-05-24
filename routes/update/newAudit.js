import express from "express";
import { database, get, ref, set, update } from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/new-audit", async (req, res) => {
  const request = req.body;
  console.log(request);
  try {
    const auditRef = ref(database, `System/auditInfo/auditList/${request.keys}`);
    const keyRef = ref(database, `System/auditInfo/auditKeys/${request.keys}/binded`);
    await set(auditRef, {
      title: request.title,
      type: request.type,
      key: request.keys,
      acronym: `${request.acronym}`.toUpperCase()
    });
    await set(keyRef, true );
    res.status(200).json({message: "success", sucess: "success"})
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});


export default router