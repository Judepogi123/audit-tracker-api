import express from "express";
import {
  database,
  update,
  ref,
  set,
  remove,
} from "../../firebase/dbConfig.js";

const router = express.Router();

const handleGetKey = async(value)=>{
  try {
    const newCopy = value.map((item)=> item.split("#"))
    return newCopy
  } catch (error) {
    console.log(error);
  }
}

router.post("/archive-area", async (req, res) => {
  const request = req.body;
  try {
    const dataRef = ref(database, `System/auditInfo/fields/${request.pushKey}`);
    await set(
      ref(database, `System/auditInfo/fields/${request.pushKey}/dateArchived`),
      request.date
    );
    await update(dataRef, {
      archived: true,
    });
    res.status(200).json({ message: `Success` });
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.post("/lock-area", async (req, res) => {
  const request = req.body;
  try {
    const dataRef = ref(database, `System/auditInfo/fields/${request.pushKey}`);
    await update(dataRef, {
      locked: !request.status,
    });
    res.status(200).json({ message: `Success` });
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.post("/unarchive-area", async (req, res) => {
  const request = req.body;
  console.log(request);
  if(!request)return
  try {
    await Promise.all(
      Object.values(request.dataList).map(async (item) => {
        console.log("Item:", item);
        await update(ref(database, `System/auditInfo/fields/${item}`), {
          archived: false,
        });
        await remove(
          ref(database, `System/auditInfo/fields/${item}/dateArchived`)
        );
      })
    );
    res.status(200).json({ message: `Success` });

  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.post("/unarchive-compliance", async (req, res) => {
  const request = req.body;

  const data = await handleGetKey(request.dataList)
  if(!request)return
  try {
    await Promise.all(
      Object.values(data).map(async (item) => {
        console.log("Item:", item);
        await update(ref(database, `Compliance/${item[1]}/${item[0]}`), {
          archived: false,
        });
        // await remove(
        //   ref(database, `System/auditInfo/fields/${item}/dateArchived`)
        // );
      })
    );
    res.status(200).json({ message: `Success` });

  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.post("/delete-compliance", async (req, res) => {
  const request = req.body;

  const data = await handleGetKey(request.dataList)
  if(!request)return
  try {
    await Promise.all(
      Object.values(data).map(async (item) => {
        const complianceRef = ref(database, `Compliance/${item[1]}/${item[0]}`)
        await remove(complianceRef)
      })
    );
    res.status(200).json({ message: `Success` });

  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default router;
