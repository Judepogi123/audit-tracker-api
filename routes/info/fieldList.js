import express from "express"
import { database,ref,get } from "../../firebase/dbConfig.js"
const router = express.Router()

router.get("/field-list", async(req, res)=>{
    try {
        const dataRef = ref(database, `System/auditInfo/auditList`)
        const snapshot = await get(dataRef)
        if(snapshot.exists()){
            res.status(200).json(Object.values(snapshot.val()))
        }else{
            res.status(200).json([])
        }
    } catch (error) {
        res.status(500).json({message: `Server erorr: ${error}`, status: "error"})
    }
})

export default router