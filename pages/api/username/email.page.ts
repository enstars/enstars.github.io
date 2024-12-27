import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

export default async function handlers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const username = req.body.username;
    const shouldBeCensored = req.body.censored;
    const db = getFirestore();
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnap = await getDocs(q);
    if (!!!querySnap.size) {
      res
        .status(404)
        .send({ message: "A user with this username does not exist." });
    }

    const user = querySnap.docs[0];
    const email: string = user.data().email as string;

    z.string().email().parse(email);

    if (shouldBeCensored) {
      const splitEmail = email.split("@");
      const username = splitEmail[0];
      const domainName = splitEmail[1];
      const censoredEmailUsername: string = username
        .split("")
        .map((chara, index) => (index < 2 ? chara : "*"))
        .join("");
      const censoredDomainName: string = domainName
        .split("")
        .map((chara, index) => (index < 1 || chara === "." ? chara : "*"))
        .join("");
      const censoredEmail = `${censoredEmailUsername}@${censoredDomainName}`;
      res.status(200).send({ email: censoredEmail });
    } else {
      res.status(200).send({ email });
    }
  } catch {
    res.status(500).send({ message: "An unknown error occurred" });
  }
}
