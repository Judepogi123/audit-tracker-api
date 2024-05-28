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
  getDownloadURL,
  deleteObject,
} from "../../firebase/dbConfig.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload-profile", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { username } = req.body;
  if (!file || !username) {
    return res.status(400).send({ message: "No file or username provided" });
  }

  try {
    const userRef = doc(firestore, "user_data", username);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const oldProfilePictureUrl = userSnapshot.data().userProfilePicture;
      const newFileRef = storageRef(
        gStorage,
        `profiles/${username}_${file.originalname}`
      );

      await uploadBytes(newFileRef, file.buffer);
      const newPublicUrl = await getDownloadURL(newFileRef);

      await updateDoc(userRef, { userProfilePicture: newPublicUrl });

      if (oldProfilePictureUrl) {
        try {
          const decodedUrl = decodeURIComponent(oldProfilePictureUrl);
          const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
          const pathIndex = decodedUrl.indexOf("/o/") + 3;
          const endIndex = decodedUrl.indexOf("?alt=media");

          if (pathIndex !== -1 && endIndex !== -1) {
            const oldFilePath = decodedUrl.substring(pathIndex, endIndex);
            const oldFileRef = storageRef(gStorage, oldFilePath);
            await deleteObject(oldFileRef);
          }
        } catch (error) {
          console.error("Error deleting old profile picture:", error);
        }
      }

      res.status(200).json({ message: `Success`, status: "ok", url: newPublicUrl });
    } else {
      res.status(404).json({ message: `User not found`, status: "failed" });
    }
  } catch (error) {
    console.error("Error during profile picture upload:", error);
    res.status(500).send({ message: "Upload failed", error: error.message });
  }
});

export default router;
