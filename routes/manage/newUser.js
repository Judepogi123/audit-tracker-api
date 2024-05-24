import express from "express";
import { database, deleteDoc, firestore } from "../../firebase/dbConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  set,
  get,
  ref,
  storage,
} from "../../firebase/dbConfig.js";
import argon from "argon2";
import CryptoJS from "crypto-js";

const router = express.Router();

const handleHashing = (pass) => {
  try {
    const hashed = CryptoJS.MD5(pass);
    return `${hashed}`;
  } catch (error) {
    console.log(error);
  }
};

const handleAdminHashing = async (password) => {
  try {
    const hashed = await argon.hash(password);
    return hashed;
  } catch (error) {
    console.log(error);
  }
};

router.post("/new-user", async (req, res) => {
  const request = req.body;
  try {
    const permissionList = {
      compliance: request.compliance,
      files: request.files,
      logs: request.logs,
      municipals: request.municipals,
      users: request.users,
      archived: request.archived,
    };
    const username = `${request.username}`.replace(/\s/g, "");
    const password = await handleAdminHashing(request.password);
    const userDoc = doc(firestore, `user_data`, request.username);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      res
        .status(200)
        .json({ message: "Username already exists.", status: "existed" });
    } else {
      await setDoc(doc(firestore, `user_data`, username), {
        userFullName: request.username,
        userZoneId:
          request.userType === "provincial"
            ? "null"
            : request.userType === "barangay"
            ? request.barangay
            : request.assignedMunicipal,
        userProfilePicture:
          "https://firebasestorage.googleapis.com/v0/b/audit-tracker-d4e91.appspot.com/o/440828437_6902353899864323_6920244013575308_n.png?alt=media&token=ef3ee647-c648-4e23-9f3d-f49be0d4a1f0",
        userType: request.userType === "provincial" ? "headAdmin" : "client",
        userPassword:
          request.userType === "provincial"
            ? password
            : handleHashing(request.password),
        userName: username,
        userPermission:
          request.userType === "provincial"
            ? JSON.stringify(permissionList)
            : null,
        userLocaleType:
          request.userType === "provincial" ? "null" : request.userType === "barangay"? "barangay" : "municipal",
        userAddress:
          request.userType === "provincial"
            ? "provincial"
            : request.userType === "barangay"
            ? request.barangay
            : request.assignedMunicipal,
      });

      res
        .status(200)
        .json({ message: "User added successfully", status: "success" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal server error: ${error}`, status: "error" });
  }
});

router.delete('/delete-user', async(req,res)=>{
  const {username} = req.query
  console.log(username);
  try {
    const docRef = doc(firestore, "user_data", username)
    await deleteDoc(docRef)
    res.status(200).json({message: "Success", status: "ok"})
  } catch (error) {
    res.status(500).json({message: "faield", status: "failed"})
  }
})

export default router;
