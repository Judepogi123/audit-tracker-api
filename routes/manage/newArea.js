import express from "express";
import { database, get, ref, set, push } from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/new-area", async (req, res) => {
  const request = req.body;
  console.log(request);
  try {
    const { areaKey, date, auditID, title, desc, draftedField } = request;

    if (areaKey && date && auditID && title) {
      const areaPushKey = await push(
        ref(database, `System/auditInfo/draft/area/`)
      );
      // const areadraftCheck = ref(database,`System/auditInfo/draft/area/${areaKey}`)
      // const areaSnapshot = await get(areadraftCheck)
      const areaPath = ref(database, `System/auditInfo/fields/${areaKey}`);
      const snapshot = await get(areaPath);
      const type = snapshot.exists() ? "Editing" : "New";
      const areaID = snapshot.exists() ? areaKey : areaPushKey.key;
      
      await set(ref(database, `System/auditInfo/draft/area/${areaID}`), {
        timestamp: date,
        auditKey: auditID,
        areaKey: areaID,
        title: title,
        description: desc || null,
        type: type,
        draftedField: type === "New" ? "[]" : JSON.stringify(draftedField),
      });
      res.status(200).json({ message: "success", status: null, key:areaID });
    } else {
      res.status(400).json({ message: "Missing required fields" });
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router;
