import express from "express";
import {
  firestore,
  getDocs,
  orderBy,
  collection,
  fQuery,
  limit,
  fStartAfter,
  getDoc,
  doc,
  updateDoc,
  where,
} from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    // Get the 'startAfter' parameter from the request query for pagination
    const { pageParam } = req.query;
    const startIndex = pageParam == "initial" ? 1 : pageParam;

    // Initialize the query with ordering and limiting
    let initialQuery = fQuery(
      collection(firestore, "user_data"),
      orderBy("userName"),
      limit(4)
    );

    // Modify the query to start after a specific userName if provided
    if (pageParam) {
      const startData = fQuery(
        collection(firestore, "user_data"),
        orderBy("userName"),
        fStartAfter(startIndex),
        limit(4)
      );
      initialQuery = startData;
    }

    // Execute the query
    const documentSnapshots = await getDocs(initialQuery);

    // Map the results to an array of data
    const dataList = documentSnapshots.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Determine the last visible document
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];

    // Send the response with the data and pagination information
    res.status(200).json({
      data: dataList,
      lastVisible: lastVisible ? lastVisible.data().userName : null,
    });
  } catch (error) {
    console.log(error);
    // Send an error response with a message
    res.status(500).json({ message: error.message });
  }
});

router.post("/archive-user", async (req, res) => {
  const request = req.body;
  if (!request) return;
  try {
    const userRef = doc(firestore, `user_data`, request.username);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      await updateDoc(userRef, { userIsArchived: !request.status });
      res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    res.status(500).json({ message: `${error}` });
  }
});

router.post("/update-user", async (req, res) => {
  const request = req.body;
  if (!request) return;
  try {
    const userRef = doc(firestore, `user_data`, request.userName);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      await updateDoc(userRef, { ...request.data });
      res.status(200).json({ message: "Success" });
    } else {
      res.status(200).json({ message: "User not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: `${error}` });
  }
});

router.get('/search-user', async (req, res) => {
  const { searchQuery } = req.query;
  if (!searchQuery || searchQuery === "") {
    return res.status(400).json({ message: "Search query must be provided" });
  }

  try {
    const userRef = collection(firestore, "user_data");
    const lowerCaseQuery = searchQuery;
    console.log(lowerCaseQuery);
    const q = fQuery(
      userRef,
      where("userFullName", ">=", lowerCaseQuery),
      where("userFullName", "<=", lowerCaseQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);

    let results = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", status: "failed" });
  }
});

export default router;
