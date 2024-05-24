import express from "express"

import { firestore,database } from "../firebase/dbConfig.js"
import { getDoc,doc } from "firebase/firestore"

const router = express.Router()

router.use(express.json())

router.get("/user-data", async(req, res)=>{
    const data = req.query.username
    try {
        const userPath = doc(firestore, "user_data", data)
        const snapshot = await getDoc(userPath)
        if(snapshot.exists()){
            const data = snapshot.data()
            res.status(200).json(data)
        }else{
            res.status(401).json({message: "User not found.", status: "error"})
        }
    } catch (error) {
        res.status(408).json({message: ` 408 ${error}`})
    }
    
})

export default router