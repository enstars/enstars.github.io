import {
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AuthUserContext } from "next-firebase-auth";
import { Dispatch, SetStateAction } from "react";

import { parseStringify } from "services/utilities";
import { UserData, UserPrivateData, CardCollection } from "types/makotools";

/**
 * When querying documents using where(), a maximum of
 * 10 values can be passed to most operators
 * https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 */
export const FIRESTORE_MAXIMUM_WHERE_VALUES = 10;

export async function setFirestoreUserData(data: any, priv = false) {
  const clientAuth = getAuth();
  const db = getFirestore();
  if (clientAuth.currentUser === null) {
    throw new Error("User is not authenticated");
  }
  try {
    await setDoc(
      doc(
        db,
        priv ? `users/${clientAuth.currentUser.uid}/private` : "users",
        priv ? "values" : clientAuth.currentUser.uid
      ),
      data,
      {
        merge: true,
      }
    );
  } catch (error) {
    throw new Error("Could not update Firebase user data");
  }
}

export async function getFirestoreUserData(
  uid: string
): Promise<UserData | null> {
  // const clientAuth = getAuth();
  // console.log("clientAuth", clientAuth);
  const db = getFirestore();

  // if (clientAuth.currentUser === null) {
  //   return undefined;
  // }
  const docSnap = await getDoc(doc(db, "users", uid));

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as UserData;
  } else {
    return null;
  }
}

export async function getFirestorePrivateUserData(uid: string) {
  const clientAuth = getAuth();
  const db = getFirestore();

  const docSnap = await getDoc(doc(db, `users/${uid}/private`, "values"));

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data as UserPrivateData;
  } else {
    return null;
  }
}

export async function validateUsernameDb(
  username: string | undefined
): Promise<boolean | undefined> {
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

export async function sendPasswordReset(
  email: string,
  setEmailSent: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>
) {
  const clientAuth = getAuth();
  sendPasswordResetEmail(clientAuth, email)
    .then((res) => {
      setEmailSent(true);
    })
    .catch((error) => {
      const e = error as Error;
      setError(e.message);
    });
}

export async function getFirestoreUserCollection(
  user: AuthUserContext | null,
  userDB: UserData | null | undefined,
  profileUID: string | undefined,
  privateUserDB: UserPrivateData | null | undefined
) {
  const db = getFirestore();
  if (!user || !profileUID) throw new Error("Missing data");

  const accessiblePrivacyLevel = userDB
    ? user.id === profileUID
      ? 3
      : (privateUserDB?.friends__list ?? []).includes(profileUID)
      ? 2
      : 1
    : 0;

  let querySnap,
    userCollection: CardCollection[] = [];
  try {
    querySnap = await getDocs(
      query(
        collection(db, `users/${profileUID}/card_collections`),
        where("privacyLevel", "<=", accessiblePrivacyLevel)
      )
    );

    querySnap.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const data = doc.data();
      data.id = doc.id;
      userCollection.push(data as CardCollection);
    });
  } catch (e) {
    console.info(
      accessiblePrivacyLevel,
      `users/${profileUID}/card_collections`,
      e
    );
    console.error(e);
  }
  return userCollection;
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
}

// export async function getFirestoreUserProfile([profileAddress, user]: [
//   string,
//   User
// ]) {
//   const db = getFirestore();
//   let profile;

//   try {
//     const q: any = query(
//       collection(db, "users"),
//       where("username", "==", user.db.username)
//     );
//     const querySnap = await getDocs(q);
//     profile = parseStringify(querySnap.docs[0].data());

//     return profile;
//   } catch (e) {
//     console.error(e);
//   }

//   return profile;
// }
export async function getFirestoreUserProfile(uid: string) {
  const db = getFirestore();
  let profile;

  try {
    const docSnap = await getDoc(doc(db, `users`, uid));
    profile = parseStringify(docSnap.data());

    return profile;
  } catch (e) {
    console.error(e);
  }

  return profile;
}
