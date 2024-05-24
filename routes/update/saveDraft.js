import express from "express";
import { database, ref, get, set, update} from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/saved-area-draft", async (req, res) => {
  const request = req.body;
  try {
    await update(
      ref(
        database,
        `System/auditInfo/draft/area/${request.areaKey}`
      ),
      {draftedField: request.draftedField, timestamp:request.date }
    );

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ message: `Internal server error`, status: "error" });
  }
});

export default router;
