import express from "express";
import multer from "multer";
import {
  storageRef,
  uploadBytes,
  storage as gStorage,
  firestore,
  getDoc,
  updateDoc,
  doc,
  getDownloadURL
} from "../../firebase/dbConfig.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload-profile", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { username } = req.body;
  if (!file && !username) {
    return res.status(400).send({ message: "No file uploaded" });
  }
  try {
    const userRef = doc(firestore, "user_data", username);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
        const fileRef = storageRef(gStorage, `profiles/${username}_${file.originalname}`);
        await uploadBytes(fileRef, file.buffer);
  
        const publicUrl = await getDownloadURL(fileRef);

      await updateDoc(userRef, { userProfilePicture: publicUrl });
      res
        .status(200)
        .json({ message: `Success`, status: "ok", url: publicUrl });
      return;
    }
    res.status(404).json({ message: `User not found`, status: "failed" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Upload failed", error: error.message });
  }
});

export default router;
