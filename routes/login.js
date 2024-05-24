import express from "express";
import { firestore, getDoc, doc, updateDoc } from "../firebase/dbConfig.js";
import argon from "argon2";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(express.json());

const jwtSecret =
  "84b84c3ee0d05ed64cc56d89dd9f80a6fba0c5fde53dc399a48dfb6629ada8ba69d5eb1b8c61cc18e442534e0d3b495a1f1f5e70ecbb05f80e0e4e30524750b1";
const handleAdminHashing = async (password) => {
  try {
    return await argon.hash(password);
  } catch (error) {
    throw new Error(error);
  }
};

const handleGetUser = async (username, password) => {
  try {
    //console.log(`Fetching user: ${username}`);
    const userDoc = doc(firestore, "user_data", username);
    const userDocSnapshot = await getDoc(userDoc);

    if (!userDocSnapshot.exists()) {
      //console.log("User does not exist");
      return "invalidUsername";
    }

    const userData = userDocSnapshot.data();
    if (!userData) {
      //console.log("No user data found");
      return "invalidUsername";
    }
    if (userData.userIsArchived) {
      //console.log("User is archived");
      return "archived";
    }
    if (userData.userLocaleType !== "provincial") {
      //console.log("User locale type is not provincial");
      return "notFound";
    }

    const userName = userData.userName;
    const storedHashedPassword = userData.userPassword;
    const passwordMatch = await argon.verify(storedHashedPassword, password);

    if (!passwordMatch) {
      console.log("Password does not match");
      return "wrongPassword";
    }

    const token = jwt.sign({ userName }, jwtSecret, { expiresIn: "1h" });
    //console.log(`Generated token for ${userName}: ${token}`);
    return { username: userName, token };
  } catch (error) {
    //console.error(`Error in handleGetUser: ${error}`);
    throw new Error(`Error: ${error}`);
  }
};

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginStatus = await handleGetUser(username, password);

    if (loginStatus === "invalidUsername") {
      res.status(200).json({
        message: "Invalid username",
        status: false,
        target: "username",
      });
      return;
    }
    if (loginStatus === "archived") {
      res.status(200).json({
        message: "Account archived/suspended",
        status: false,
        target: "none",
      });
      return;
    }
    if (loginStatus === "wrongPassword") {
      res.status(200).json({
        message: "Incorrect password",
        status: false,
        target: "password",
      });
      return;
    }
    if (loginStatus === "notFound") {
      res.status(200).json({
        message: "Invalid user locale type",
        status: false,
        target: "none",
      });
      return;
    }
    if (!loginStatus) {
      res.status(200).json({ message: "Unknown error", status: false });
      return;
    }

    const { username: validUsername, token } = loginStatus;
    if (!token) {
      console.log("No token generated");
      res.status(500).json({ message: "No token generated", status: false });
      return;
    }
    //console.log(`Sending token for ${validUsername}: ${token}`);
    res
      .status(200)
      .json({ message: "Success", username: validUsername, token });
  } catch (error) {
    //console.error(`Error in /login route: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required", status: "failed" });
  }
console.log(password);
  try {
    const userRef = doc(firestore, `user_data`,username);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const newPassword = await handleAdminHashing(password);
      await updateDoc(userRef, { userPassword: newPassword});

      return res.status(200).json({ message: "Password reset successful", status: "ok" });
    } else {
      return res.status(404).json({ message: "User not found", status: "failed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", status: "failed" });
  }
});


export default router;
