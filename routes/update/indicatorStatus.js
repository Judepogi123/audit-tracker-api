import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { get, ref, set, update } from "../../firebase/dbConfig.js";

const router = express.Router();
router.use(express.json());

const handleUpdateIndicatorStatus = async (args, id, status) => {
  if (!args) return;
  const data = JSON.parse(args);

  let temp = Object.values(data);
  const findItem = async (list) => {
    if (!list) return;
    for (const item of Object.values(list)) {
      if (item.pushKey === id) {
        item.status = !status;
        return;
      }

      if (item.subIndicator) {
        findItem(item.subIndicator);
      }
    }
  };

  findItem(temp);
  return JSON.stringify(temp);
};

router.post("/indicator-status", async (req, res) => {
  const request = req.body;
  if (!request) return;
  console.log(request);
  try {
    const dataRef = ref(
      database,
      `Municipalities/${request.zipCode}/submittedForm/${request.pushKey}`
    );
    const snapshot = await get(dataRef);
    console.log("123");
    if (snapshot.exists()) {
      console.log("Hahaha");
      const data = snapshot.val();
      const parsedData = await handleUpdateIndicatorStatus(
        data.fieldAnswers,
        request.indicatorID,
        request.indicatorStatus
      );
      await update(
        ref(
          database,
          `Municipalities/${request.zipCode}/submittedForm/${request.pushKey}`
        ),
        {
          fieldAnswers: parsedData,
        }
      );

      await update(
        ref(database, `Compliance/${request.zipCode}/${request.pushKey}`),
        {
          fieldAnswers: parsedData,
        }
      );

      res
        .status(200)
        .json({ message: "Success", error: null, data: data.fieldAnswers });
    } else {
      res.status(404).json({ message: "Item not found.", error: "error" });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}`, error: "error" });
  }
});

export default router;
