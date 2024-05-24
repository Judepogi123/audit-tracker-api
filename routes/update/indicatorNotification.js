import express from "express";
import { database, get, ref, set, push } from "../../../firebase/dbConfig.js";
import { update } from "../../../firebase/dbConfig.js";

const router = express.Router();

const handleUpdateIndicatorStatus = async (args, id, data, date) => {
  if (!args && !data && !date) return;
  const parsedData = JSON.parse(args);

  // Check if parsedData is undefined or null before using Object.values
  if (!parsedData) {
    console.error("parsedData is undefined or null in handleUpdateIndicatorStatus");
    return; // Handle the case where parsedData is missing
  }

  let temp = Object.values(parsedData);
  const findItem = async (list) => {
    if (!list) return;
    for (const item of Object.values(list)) {
      if (item.pushKey === id && item.notice) {
        let temp = item.notice; // Use existing notice value or default to undefined
        const tempString = JSON.parse(temp || "{}"); // Parse empty string if notice is undefined
        const stringTemp = Object.values(tempString).push({
          title: data,
          dateSent: date,
        });
        item.notice = JSON.stringify(stringTemp);
        return;
      }

      if (item.subIndicator) {
        findItem(item.subIndicator);
      }
    }
  };

  findItem(temp);
  return temp;
};

router.post("/indicator-notification", async (req, res) => {
  const request = req.body;
  try {
    const complianceRef = ref(
      database,
      `Compliance/${request.zipCode}/${request.complianceID}`
    );

    const compliancePath = ref(database, `Compliance/${request.zipCode}/${request.complianceID}/fieldAnswers`)

    const snapshot = await get(complianceRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const stringedFieldAnswer = data.fieldAnswers;
      let updatedData = await handleUpdateIndicatorStatus(
        stringedFieldAnswer,
        request.pushKey,
        request.data,
        request.date
      );

      console.log(updatedData);

      const temp = JSON.stringify(updatedData)

      if (!updatedData) {
        res.status(404).json({ message: "item not found" });
      } else {
        await set(compliancePath, temp); 

        await set(
          ref(
            database,
            `Municipalities/${request.zipCode}/submittedForm/${request.complianceID}/fieldAnswers`
          ),
          temp
        );

        const notificationRef = ref(
          database,
          `Municipalities/${request.zipCode}/notifications`
        );

        const notificationPushKey = push(notificationRef);
        await set(
          ref(
            database,
            `Municipalities/${request.zipCode}/notifications/${notificationPushKey.key}`
          ),
          {
            title: "",
            message: "",
            pushKey: notificationPushKey.key,
            timestamp: request.date,
          }
        );

        const logRef = ref(database, `System/activityLogs`);
        const activityLogsPushKey = push(logRef);

        await set(
          ref(database, `System/activityLogs/${activityLogsPushKey.key}`),
          {
            title: `Notified `,
            date:  request.date
          }
        );

        res.status(200).json({ message: "Success", error: null });
      }
    } else {
      res.status(404).json({ message: "Item not found.", error: "error" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: `Server error: ${error}`, status: "error" });
  }
});

export default router;
