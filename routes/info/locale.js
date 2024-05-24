import express from "express";
import {
  database,
  ref,
  get,
  dbQuery,
  limitToLast,
  startAfter,
  orderByChild,
  limitToFirst,
  orderByKey,
  startAt,endAt,
  remove
} from "../../firebase/dbConfig.js";

const router = express.Router();

router.get("/locale", async (req, res) => {
  try {
    const localeRef = ref(database, `Municipalities`);
    const snapshot = await get(localeRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      res.status(200).json(Object.values(data));
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

router.get("/all-locale", async (req, res) => {
  const { pageParam } = req.query;
  const lastIndex = pageParam === "initial" ? 1 : pageParam;
  if(pageParam === undefined)return
  try {
    const localeRef = ref(database, `Municipalities`);
    let initialQuery = dbQuery(
      localeRef,
      orderByChild("zipCode"),
      limitToFirst(10)
    );

    if (pageParam) {
      initialQuery = dbQuery(
        localeRef,
        orderByChild("zipCode"),
        startAfter(lastIndex),
        limitToFirst(10)
      );
    }

    const localeSnapshot = await get(initialQuery);

    if (!localeSnapshot.exists()) {
      return res.status(404).json({locales: [],nextCursor: null});
    }

    let locales = [];
    let lastItem = null;

    localeSnapshot.forEach((childSnapshot) => {
      locales.push(childSnapshot.val());
      lastItem = childSnapshot;
    });

    const nextCursor = lastItem ? lastItem.child("zipCode").val() : null;

    res.status(200).json({ locales, nextCursor });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
});

router.get('/search-locale', async (req, res) => {
  const { searchTerm } = req.query;
  if (!searchTerm || searchTerm.length < 1) {
    return res.status(400).json({ message: "Search term must be at least 1 character long." });
  }

  try {
    const municipalitiesRef = ref(database, 'Municipalities');
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const searchQuery = dbQuery(
      municipalitiesRef,
      orderByChild('queryKey'),
      startAt(lowerCaseSearchTerm),
      endAt(lowerCaseSearchTerm + "\uf8ff")
    );
    const searchSnapshot = await get(searchQuery);

    if (!searchSnapshot.exists()) {
      return res.status(200).json([]);
    }

    const results = [];
    searchSnapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.municipalityName.toLowerCase().includes(lowerCaseSearchTerm)) {
        results.push(data);
      }
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});



router.get(`/locale-data`, async(req, res)=>{
  const {localeID} = req.query
  try {
    const dataRef = ref(database, `Municipalities/${localeID}`)
    const snapshot = await get(dataRef)
    if(snapshot.exists()){
      const data = snapshot.val()
      res.status(200).json(data)
      return
    }
    res.status(404).json({message: "Item not found!"})
  } catch (error) {
    res.status(500).send(`${error}`)
  }
})

router.delete(`/remove-locale`, async(req, res)=>{
  const {localeID} = req.query
  try {
    const dataRef = ref(database, `Municipalities/${localeID}`)
    const snapshot = await get(dataRef)
    if(snapshot.exists()){
      await remove(dataRef)
      res.status(200).json({message: "Success!"})
      return
    }
    res.status(404).json({message: "Item not found!"})
    
  } catch (error) {
    res.status(500).send(`${error}`)
  }
})

export default router;
