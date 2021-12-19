import { auth, firestore } from "../Firebase/index";

// This function stores user information seperately when a user signs up
const userSave = () => {
  let displayName = auth.currentUser?.displayName;
  let uid = auth.currentUser?.uid;

  firestore
    .collection("users")
    .doc(uid)
    .set({
      uid,
      displayName,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

export default userSave;
