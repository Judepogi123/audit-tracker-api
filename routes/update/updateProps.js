import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { get, ref, set, update } from "../../firebase/dbConfig.js";

const router = express.Router();

const handleUpdateCheckBy = async (list, username) => {
  try {
    const temp = list ? JSON.parse(list) : [];
    let found = false;
    for (let item of temp) {
      if (item === username) {
        found = true;
        break;
      }
    }
    if (!found) {
      temp.push(username);
    }
    return JSON.stringify(temp);
  } catch (error) {
    console.log(error);
  }
};

router.post("/update-props", async (req, res) => {
  const request = req.body;
  if (!request) return;

  try {
    const dataRef = ref(
      database,
      `Compliance/${request.code}/${request.pushKey}`
    );
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      await update(dataRef, {
        viewed: true,
        checkedBy: request.userList,
        status: request.status === "done" ? request.status : "ongoing",
      });
      res.status(200).json({ message: "success", status: "success" });
    } else {
      res.status(200).json({ message: "Item not found", status: "error" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Sorry something went wrong: ${error}`,
      error: "error",
    });
  }
});

router.post(`/return-compliance`, async (req, res) => {
  const request = req.body;
  if (!request) return;
  try {
    const dataRef = ref(
      database,
      `Compliance/${request.zipCode}/${request.complianceID}`
    );
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      await update(dataRef, { status: "done" });
      await set(
        ref(
          database,
          `Compliance/${request.zipCode}/${request.complianceID}/reviewed`
        ),
        `${request.date}`
      );
      res.status(200).json({ message: "Success" });
    } else {
      res.status(200).json({ message: `Item not found` });
    }
  } catch (error) {}
});

router.post(`/archive-compliance`, async (req, res) => {
  const request = req.body;
  if (!request) return;
  try {
    const dataRef = ref(
      database,
      `Compliance/${request.zipCode}/${request.complianceID}`
    );
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      await set(
        ref(
          database,
          `Compliance/${request.zipCode}/${request.complianceID}/archived`
        ),
        true
      );
      await set(
        ref(database, `System/Archived/compliance/${request.complianceID}`),
        {
          ...request.data,
          dateArchived: request.date
        }
      );
      res.status(200).json({ message: "Success" });
    } else {
      res.status(200).json({ message: `Item not found` });
    }
  } catch (error) {}
});

export default router;
