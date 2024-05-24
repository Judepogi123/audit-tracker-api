import express from "express";
import { database } from "../../../firebase/dbConfig.js";
import { get, ref, set, update } from "../../../firebase/dbConfig.js";

const router = express.Router();

// router.get("/updateCompliance", async(req, res)=>{
//     console.log("dasdas");
//     res.status(200).json({msg: "dasdsad"})
//     const request = req.body;
//     if(!request)return
//     console.log(request.zipCode);
//     try {
//         const dataRef = ref(database, `Compliance/${request.zipCode}/${request.pushKey}`)
//         const snapshot = await get(dataRef)
//         if(snapshot.exists()){
//             await update(dataRef, { viewed: true})
//             res.status(200).json({message: "success", status: "success"})
//         }else{
//             res.status(404).json({message: "Item not found", status: "error"})
//         }
//     } catch (error) {
//         res.status(500).json({message: `Sorry something went wrong: ${error}`, error: "error"})
//     }
// })

router.get("/testing", (req, res) => {
  try {
    res.status(200).json({msg: "Success"})
  } catch (error) {
    res.status(500).json({msg: `Stas. ${error}`})
  }
});

export default router;
