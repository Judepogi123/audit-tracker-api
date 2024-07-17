import express from "express";
import { database, get, ref, set, push } from "../../firebase/dbConfig.js";

const router = express.Router();

router.post("/new-area", async (req, res) => {
  const request = req.body;
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
      res.status(200).json({ message: "success", status: null, key: areaID });
    } else {
      res.status(400).json({ message: "Missing required fields" });
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.post(`/duplicate-item`, async (req, res) => {
  const request = req.body;
  if (!request.id) return;
  try {
    const dataRef = ref(database, `System/auditInfo/draft/area/${request.id}`);
    const snapshot = await get(dataRef);
    const pushKey = await push(ref(database, `System/auditInfo/draft/area/`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      await set(ref(database, `System/auditInfo/draft/area/${pushKey.key}`), {
        ...data,
        areaKey: pushKey.key,
        timestamp: request.date,
      });
      res.status(200).json({ message: "Success!" });
      return;
    }
    res.status(404).json({ message: "Item not found!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router;
