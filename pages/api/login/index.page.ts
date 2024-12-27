import {
  setAuthCookies,
  verifyIdToken,
  getFirebaseAdmin,
} from "next-firebase-auth";
import { FieldValue } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { migrateCollection } from "../collections/migrate.page";

import { initAuthentication } from "services/firebase/authentication";
import { getAuth } from "firebase/auth";

try {
  initAuthentication();
} catch (e) {
  console.error(e);
}

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();

async function validateSUID(
  docCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  suid: string
) {
  const querySnap = await docCollection.where("suid", "==", suid).get();
  const suidValid = querySnap.size === 0;
  return suidValid;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await setAuthCookies(req, res);
    const authToken = req.headers.authorization;
    if (!authToken) return;

    const authUser = await verifyIdToken(authToken);
    if (!authUser.id) return;

    const db = getFirebaseAdmin().firestore();
    const docCollection = db.collection("users");
    const docRef = docCollection.doc(authUser.id);
    const docGet = (await docRef.get())?.data();

    let suid = docGet?.suid;
    if (!suid) {
      let uniqueSUID = "";
      while (uniqueSUID.length === 0) {
        uniqueSUID = genRanHex(6);
        if (await validateSUID(docCollection, uniqueSUID)) {
          suid = uniqueSUID;
        } else {
          uniqueSUID = "";
        }
      }
    }
    let username = docGet?.username || suid;
    if (!docGet?.joinDate) {
      await docRef.set(
        {
          joinDate: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const fixedCardCounts = docGet?.collection
      ? {
          collection: docGet.collection
            .filter((c: any) => c.count > 0)
            .map((c: any) => ({
              ...c,
              count: Math.min(c.count, 5),
            })),
        }
      : {};

    let migrated = docGet?.migrated || true;

    await docRef.set(
      {
        email: authUser?.email || null,
        lastLogin: FieldValue.serverTimestamp(),
        suid,
        username,
        migrated,
        ...fixedCardCounts,
      },
      { merge: true }
    );

    if (!docGet?.migrated) {
      await migrateCollection(authUser.id, docGet?.collection);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export default handler;
