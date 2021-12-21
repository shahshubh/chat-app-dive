import { auth, firestore } from "../Firebase/index";
import { generateDiceBearAvatars } from './generateAvatar';

// This function stores user information seperately when a user signs up
const userSave = () => {
  let displayName = auth.currentUser?.displayName;
  let uid = auth.currentUser?.uid;
  let avatarUrl = generateDiceBearAvatars(Math.random());

  firestore
    .collection("users")
    .doc(uid)
    .set({
      uid,
      displayName,
      avatarUrl
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
};

export default userSave;
