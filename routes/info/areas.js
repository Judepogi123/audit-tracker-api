import express from "express";
import { database, get, ref} from "../../firebase/dbConfig.js";


const router = express.Router();

router.get("/areas", async (req, res) => {
  try {
    const dataRef = ref(database, `System/auditInfo/fields`);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
        const data = Object.values(snapshot.val())
        res.status(200).json(data)
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router
