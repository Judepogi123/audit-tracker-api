import express from "express";
import { database, ref, get, remove } from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/drafted-area", async (req, res) => {
  const request = req.query;
  try {
    const { areaKey } = request;
    if (areaKey) {
      const dataRef = ref(database, `System/auditInfo/draft/area/${areaKey}`);
      const snapshot = await get(dataRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        res.status(200).json({ ...data });
      } else {
        res.status(404).json({ message: "Item not found", status: "error" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error`, status: "error" });
  }
});

router.delete("/delete-drafted", async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: "Bad Request: Missing id parameter" });
  }

  try {
    const dataRef = ref(database, `System/auditInfo/draft/area/${id}`);
    await remove(dataRef);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(`Error deleting draft with id ${id}:`, error);
    res.status(500).json({ message: `Sorry, something went wrong: ${error.message}` });
  }
});

export default router;
