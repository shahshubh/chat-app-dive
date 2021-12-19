import { auth, firestore, firebase } from "../Firebase/index";

// This function changes status of a message sent to the use from single tick to double tick
const changeStatus = () => {
  firestore
    .collection("pipeline")
    .doc(auth.currentUser?.uid)
    .collection("sent")
    .onSnapshot((snapshot) => {
      snapshot.docs.map((doc) => {
        console.log(doc.data());
        firestore
          .collection("chats")
          .doc(doc.data().room)
          .collection("messages")
          .doc(doc.data().id)
          .update({
            status: "received",
          });
        firestore
          .collection("pipeline")
          .doc(auth.currentUser?.uid)
          .collection("sent")
          .doc(doc.id)
          .delete();
      });
    });
};

export default changeStatus;
