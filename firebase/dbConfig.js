import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,where,collection,
  query as fQuery,
  limit,
  getDocs,
  startAfter as fStartAfter,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  get,
  set,
  ref,
  push,
  update,
  onValue,
  off,
  remove,
  query as dbQuery,
  limitToLast,
  limitToFirst,
  orderByKey,
  startAfter,
  orderByChild,
  equalTo,
  startAt,endAt
} from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes,getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDDQNhxuGUmz-tDA2EFcOq3F7uMDRU7VUM",
  authDomain: "audit-tracker-d4e91.firebaseapp.com",
  databaseURL: "https://audit-tracker-d4e91-default-rtdb.firebaseio.com",
  projectId: "audit-tracker-d4e91",
  storageBucket: "audit-tracker-d4e91.appspot.com",
  messagingSenderId: "927395022304",
  appId: "1:927395022304:web:8357868ed8e766cb581785",
  measurementId: "G-ZENMG5X65S",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export {
  get,
  set,
  ref,
  push,
  remove,
  update,
  onValue,
  dbQuery,
  limitToLast,
  limitToFirst,
  orderByKey,
  orderByChild,
  startAfter,
  startAt,
  endAt,
  equalTo,
  off,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  orderBy,
  fStartAfter,
  where,
  storageRef,
  uploadBytes,
  collection,
  fQuery,
  limit,
  getDownloadURL,
  deleteDoc
};
