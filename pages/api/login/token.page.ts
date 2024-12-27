import {
  collection,
  Firestore,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAdmin } from "next-firebase-auth";

enum Errors {
  NOT_FOUND = "Could not find user with this username",
  INCOMPLETE = "Missing credentials",
  UNAUTHED = "Invalid credentials",
}

async function validateUsernameDb(
  username: string | undefined
): Promise<boolean | undefined> {
  try {
    const db = getFirestore();
    const q = query(
      collection(db as unknown as Firestore, "users"),
      where("username", "==", username)
    );
    const querySnap = await getDocs(q);
    const usernameValid = !querySnap.empty;
    return usernameValid;
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const auth = getAuth();
    const admin = getFirebaseAdmin();
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      throw new TypeError(Errors.INCOMPLETE);
    }
    const isUsernameValid = await validateUsernameDb(username);
    if (!isUsernameValid) throw new TypeError(Errors.NOT_FOUND);
    const db = getFirestore();
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const querySnap = await getDocs(usernameQuery);
    const userData = querySnap.docs[0];
    const email = userData.data().email;
    const emailUserData = await admin.auth().getUserByEmail(email);
    if (!!!emailUserData) {
      throw new TypeError(Errors.NOT_FOUND);
    }
    const uid = userData.id;
    await signInWithEmailAndPassword(auth, email, password);
    const customToken = await admin.auth().createCustomToken(uid);
    res.status(200).send({ customToken });
  } catch (error) {
    if (error.message) {
      switch (error.message) {
        case Errors.NOT_FOUND:
          res.status(404).send(error);
          break;
        case Errors.INCOMPLETE:
          res.status(400).send(error);
          break;
        case Errors.UNAUTHED:
          res.status(403).send(error);
          break;
        default:
          res.status(500).send(error);
      }
    } else {
      res.status(500).send(error);
    }
  }
}
