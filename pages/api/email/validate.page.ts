import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const email = req.body.email;
  const db = getFirestore();
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnap = await getDocs(q);
  const emailValid = !!querySnap.size;

  if (emailValid) {
    res.status(200).send({ valid: true });
  } else {
    res.status(404).send({ valid: false });
  }
}
