import express from "express";
import {
  database,
  ref,
  get,
  set,
  doc,
  getDoc,
  firestore,
  setDoc,
} from "../../firebase/dbConfig.js";
import CryptoJS from "crypto-js";

const router = express.Router();

const handleGetName = (value, type) => {
  console.log(value);
  try {
    const temp = value.split("-");
    if (type === "name") return temp[1];
    return temp[0];
  } catch (error) {
    console.log(error);
  }
};

const handleHashing = (pass) => {
    try {
      const hashed = CryptoJS.MD5(pass).toString(CryptoJS.enc.Hex);
      return hashed;
    } catch (error) {
      console.log(error);
    }
  };

router.post("/new-locale", async (req, res) => {
  try {
    const request = req.body;
    if (!request) {
      return res.status(400).json({ message: "Request data undefined." });
    }

    const zipCode =
      request.localeType === "municipal"
        ? request.zipCode
        : handleGetName(request.municipality, "code");
    const username = `${zipCode}-${request.localeName}`.replace(/\s/g, "").toLowerCase();
    const password = handleHashing(`${zipCode}-${request.localeName}-dilg`.replace(/\s/g, "").toLowerCase());
    const address = `${handleGetName(request.municipality, "name")}, ${request.localeName}`

    const localeRef = ref(database, `Municipalities/${username}`);
    const userRef = doc(firestore, `user_data`, username);

    const [localeSnapshot, userSnapshot] = await Promise.all([
      get(localeRef),
      getDoc(userRef),
    ]);

    if (localeSnapshot.exists() || userSnapshot.exists()) {
      return res
        .status(200)
        .json({ message: "Locale or user already exists.", status: "existed" });
    }

    await Promise.all([
      set(ref(database, `Municipalities/${username}`), {
        zipCode: username,
        municipalityName: `${
          request.localeType === "municipal"
            ? request.localeName
            : `${handleGetName(request.municipality, "name")}, ${request.localeName}`
        }`,
        type: request.localeType,
        municipalZipCode: zipCode,
        queryKey: request.localeName.toLowerCase()
      }),

      setDoc(doc(firestore, `user_data`, username), {
        userProfilePicture:
          "https://firebasestorage.googleapis.com/v0/b/audit-tracker-d4e91.appspot.com/o/440828437_6902353899864323_6920244013575308_n.png?alt=media&token=ef3ee647-c648-4e23-9f3d-f49be0d4a1f0",
        userName: username,
        userPassword: password,
        userLocaleType: request.localeType,
        userPermission: null,
        userType: "client",
        userZoneId: username,
        userFullName: request.localeName,
        userAddress: `${
            request.localeType === "municipal"
              ? request.localeName
              : address
          }`
      }),
    ]);

    return res
      .status(200)
      .json({ message: "Added successfully", status: "success" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", status: "failed" });
  }
});

export default router;
