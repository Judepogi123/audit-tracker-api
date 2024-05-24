import express from "express";
import {database, get,ref} from "../../firebase/dbConfig.js"

const router  = express.Router()

router.get("/key-list", async (req,res)=>{
    try {
        const keyRef  = ref(database, `System/auditInfo/auditKeys`)
        const snapshot = await get(keyRef)
        if(snapshot.exists()){
            res.status(200).json(Object.values(snapshot.val() || []))
        }else{
            res.status(200).json([])
        }
    } catch (error) {
        res.status(500).json({message: `Internal server error: ${error}`})
    }
})

export default router