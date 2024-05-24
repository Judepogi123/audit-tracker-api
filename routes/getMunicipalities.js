import express from "express";
import { database } from "../firebase/dbConfig.js";
import { get, ref, onValue } from "../firebase/dbConfig.js";

const router = express.Router();

router.get("/municipalities", async (req, res) => {
  try {
    const dataRef = ref(database, `Municipalities`);
    const snapshot = await get(dataRef)
    if(snapshot.exists()){
        res.status(200).json(Object.values(snapshot.val()))
    }else{
        res.status(404).json([])
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server error", status: "error" });
  }
});

export default router;
