import express from "express";
import { database } from "../../firebase/dbConfig.js";
import { get,ref,set} from "../../firebase/dbConfig.js";

const router = express.Router()

router.post("/archiveField", async(req, res)=>{
    try {
        const request = req.body
        if(!request)return
        console.log(request.date);
        const fieldRef = ref(database, `System/auditInfo/fields/${request.id}`)
        const fieldSnapshot = await get(fieldRef)
        if(fieldSnapshot.exists()){
            const data = fieldSnapshot.val()
            await set(ref(database, `System/Archived/fields/${request.id}`),{
                ...data, dateArchived: request.date
            })
            res.status(200).json({message: "Field successfully archived.", status: "success"})
        }else{
            res.status(404).json({message: "Sorry, target field not found.", status: "failed"})
        }
    } catch (error) {
        res.status(500).json({message: `${error}`})
    }
})

export default router