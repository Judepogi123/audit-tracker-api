import express from "express";
import { database } from "../../firebase/dbConfig.js";
import {
  get,
  ref,
  dbQuery,
  limitToLast,
  orderByKey,
} from "../../firebase/dbConfig.js";

const router = express.Router();

const handleGetAllCompliance = (data) => {
  let complianceList = [];
  try {
    const temp = Object.values(data);
    for (let tempData of temp) {
      if (!tempData) return;
      for (let compliance of Object.values(tempData)) {
        complianceList.push(compliance);
      }
    }
    return complianceList;
  } catch (error) {
    console.log(error);
  }
};

router.get("/compliance", async (req, res) => {
  try {
    const complianceRef = ref(database, `Compliance`);
    const snapshot = await get(
      dbQuery(complianceRef, orderByKey(), limitToLast(5))
    );
    if (snapshot.exists()) {
      const data = handleGetAllCompliance(snapshot.val());
      res.status(200).json(data);
    } else {
      res.status(200).json({ message: "No compliance found!", error: "error" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Sorry, something went wrong: ${error}`,
      status: "error",
    });
  }
});

// router.get("/locale", async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = 5;
//     const startIndex = (page - 1) * perPage;
  
//     console.log("First try", "Page:", page, "Start:", startIndex);
  
//     try {
//         const complianceRef = ref(database, `Municipalities`);
//         const query = dbQuery(
//             complianceRef,
//             orderByKey(),
//             startAt(startIndex.toString()),
//             limitToFirst(perPage)
//         );

//         const snapshot = await get(query);
  
//         if (snapshot.exists()) {
//             res.status(200).json(snapshot.val());
//         } else {
//             console.log("Not found");
//             res.status(200).json({ message: "No compliance found!", error: "error" });
//         }
//     } catch (error) {
//         console.error("Error:", error); // Log the error
//         res.status(500).json({
//             message: `Sorry, something went wrong: ${error}`,
//             status: "error",
//         });
//     }
// });


  

export default router;
