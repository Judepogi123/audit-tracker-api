import express from "express"
import { database,ref,get, } from "../../firebase/dbConfig.js"

const router = express.Router()

router.get("/area-draft-list", async(req,res)=>{
    try {
        const areaDraftRef = ref(database, `System/auditInfo/draft/area`)
        const snapshot = await get(areaDraftRef)
        if(snapshot.exists()){
            res.status(200).json(Object.values(snapshot.val()))
        }else{
            res.status(200).json(Object.values([]))
        }
    } catch (error) {
        res.status(500).json({message: `Inernal server error`, status: "error"})
    }
})

export default router