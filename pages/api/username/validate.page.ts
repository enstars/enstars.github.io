import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handlers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const username = req.body.username;
  const db = getFirestore();
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnap = await getDocs(q);
  const usernameValid = !!!querySnap.size;
  if (usernameValid) {
    res.status(200).send({ valid: true });
  } else {
    res.status(400).send({ valid: false });
  }
}
