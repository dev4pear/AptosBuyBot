import * as admin from "firebase-admin";
import * as path from "path";

const serviceAccount = path.join(
  __dirname,
  "./my-project-e697a-firebase-adminsdk-dq7oh-7927c99b4a.json"
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-project-e697a-default-rtdb.firebaseio.com/", // replace with your Firebase project database URL
});

export const db = admin.firestore();
