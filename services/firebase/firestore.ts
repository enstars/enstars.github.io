import { getAuth, sendEmailVerification } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  // serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { UserData, LoadingStatus, UserPrivateData } from "types/makotools";

/**
 * When querying documents, only 10 documents can
 * be requested at a time in one request
 * https://firebase.google.com/docs/firestore/quotas#security_rules
 */
export const FIRESTORE_MAXIMUM_CONCURRENT_ACCESS_CALLS = 10;

export function setFirestoreUserData(
  data: any,
  callback: (s: { status: LoadingStatus }) => void,
  priv = false
) {
  const clientAuth = getAuth();
  const db = getFirestore();
  if (clientAuth.currentUser === null) {
    callback({ status: "error" });
    return;
  }
  setDoc(
    doc(
      db,
      priv ? `users/${clientAuth.currentUser.uid}/private` : "users",
      priv ? "values" : clientAuth.currentUser.uid
    ),
    data,
    {
      merge: true,
    }
  ).then(
    () => {
      callback({ status: "success" });
    },
    () => {
      callback({ status: "error" });
    }
  );
}

export async function getFirestoreUserData(uid: string) {
  const clientAuth = getAuth();
  const db = getFirestore();

  if (clientAuth.currentUser === null) {
    return undefined;
  }
  const docSnap = await getDoc(
    doc(db, "users", uid || clientAuth?.currentUser?.uid)
  );

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as UserData;
  }
  return undefined;
}
export async function getFirestorePrivateUserData(uid: string) {
  const clientAuth = getAuth();
  const db = getFirestore();

  if (clientAuth.currentUser === null) {
    return undefined;
  }
  const docSnap = await getDoc(
    doc(db, `users/${uid || clientAuth?.currentUser?.uid}/private`, "values")
  );

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as UserPrivateData;
  }
  return undefined;
}

export async function validateUsernameDb(username: string) {
  const db = getFirestore();
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnap = await getDocs(q);
  const usernameValid = !!!querySnap.size;
  return usernameValid;
}

export async function sendVerificationEmail() {
  const clientAuth = getAuth();

  if (
    clientAuth.currentUser !== null &&
    !clientAuth.currentUser.emailVerified
  ) {
    sendEmailVerification(clientAuth.currentUser);
  }
}

export async function getFirestoreUserCollection() {
  return async (collectionAddress: string) => {
    const clientAuth = getAuth();
    const db = getFirestore();

    if (clientAuth.currentUser === null) {
      return undefined;
    }
    const querySnap = await getDocs(collection(db, collectionAddress));

    const userCollection: any[] = [];
    querySnap.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      userCollection.push(doc.data());
    });
    return userCollection;
  };
}

export async function getFirestoreUserDocument(
  collection: string,
  document: string,
  fallback?: any,
  customUid?: string
) {
  const clientAuth = getAuth();
  const db = getFirestore();

  if (clientAuth.currentUser === null) {
    return undefined;
  }
  const uid = customUid || clientAuth.currentUser.uid;
  const docSnap = await getDoc(doc(db, `users/${uid}/${collection}`, document));

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as UserData;
  }
  if (typeof fallback !== undefined) return fallback;
  throw new Error("nonexistent and no fallback");
  return undefined;
}
