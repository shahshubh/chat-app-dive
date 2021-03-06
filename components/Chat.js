import { useEffect, useState } from "react";
import { useList } from "react-firebase-hooks/database";
import { auth, firestore, firebase } from "../Firebase/index";
import constants from "../constants/constants";

const scrollToBottom = (element) => {
  if (element != null) {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}

const Chat = ({ data, room }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [snapshots] = useList(firebase.database().ref(`/online/${data?.uid}`));
  const [presence, setPresence] = useState();
  const [reciepientData, setReciepientData] = useState();
  const [senderData, setSenderData] = useState();

  const reciepientAvatarUrl = reciepientData && reciepientData.avatarUrl ? reciepientData.avatarUrl : constants.avatarUrl;
  const senderAvatarUrl = senderData && senderData.avatarUrl ? senderData.avatarUrl : constants.avatarUrl;
  
  useEffect(() => {
    firestore.collection("users").doc(data?.uid).get().then((doc) => {
      setReciepientData(doc.data());
    });

    firestore.collection("users").doc(auth.currentUser.uid).get().then((doc) => {
      setSenderData(doc.data());
    });

  }, [room]);

  // on page load scroll to bottom
  useEffect(() => {
    if (document.querySelector(".chat-history") !== null) {
      scrollToBottom(document.querySelector(".chat-history"));
    }
  }, [messages]);

  // This useEffect generates messages in between two users
  useEffect(() => {
    if (room) {
      const unsubscribe = firestore
        .collection("chats")
        .doc(room)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          console.log("Fetch Messages");
          setMessages(
            snapshot.docs.map((doc) => {
              if (
                (doc.data().status === "sent" ||
                  doc.data().status === "received") &&
                doc.data().receiverId === auth.currentUser?.uid
              )
                firestore
                  .collection("chats")
                  .doc(room)
                  .collection("messages")
                  .doc(doc.id)
                  .update({
                    status: "seen",
                  });
              if (
                doc.data().status === "sent" &&
                presence === "online" &&
                doc.data().senderId === auth.currentUser?.uid
              )
                firestore
                  .collection("chats")
                  .doc(room)
                  .collection("messages")
                  .doc(doc.id)
                  .update({
                    status: "received",
                  });
              return { ...doc.data(), id: doc.id };
            })
          );
        });
      // unsubscribe from firestore
      return () => {
        unsubscribe();
      }
    }

  }, [room]);

  // This useEffect checks if the receiver is online or not
  useEffect(() => {
    snapshots.map((v) => {
      if (v.val()?.seconds)
        setPresence((p) => `Last seen at ${new Date(v.val()?.seconds * 1000).toLocaleString()}`);
      else setPresence((p) => "online");
    });
  }, [snapshots]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input === "") return;
    let status = presence === "online" ? "received" : "sent";
    firestore
      .collection("chats")
      .doc(room)
      .collection("messages")
      .add({
        message: input,
        senderId: auth.currentUser?.uid,
        send: auth.currentUser?.displayName,
        receiverId: data?.uid,
        receiver: data?.displayName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status,
      })
      .then((doc) => {
        if (presence !== "online")
          firestore
            .collection("pipeline")
            .doc(data?.uid)
            .collection("sent")
            .add({ room, id: doc?.id });
      });
    setInput("");
  };

  const renderAllMessages = () => {
    return messages.map((message, i) => {
      let textClassName = message.senderId == auth.currentUser.uid
        ? "message other-message float-right"
        : "message my-message";

      let hour = new Date(message.timestamp?.seconds * 1000).getHours();
      let minute = new Date(message.timestamp?.seconds * 1000).getMinutes();
      let isPrevBySameUser = (i > 0 && message.senderId === messages[i - 1].senderId);

      return (
        <li className="clearfix" key={message.id}>
          <div className={message.senderId == auth.currentUser.uid ? "message-data text-right" : "message-data"}>
            {
              message.senderId != auth.currentUser.uid && !isPrevBySameUser
                ? <img src={reciepientAvatarUrl} alt="avatar" />
                : <></>
            }
            { hour ? <span className="message-data-time">{hour}:{minute}</span> : <></> }
            {
              message.senderId == auth.currentUser.uid && !isPrevBySameUser
                ? <img src={senderAvatarUrl} alt="avatar" />
                : <></>
            }
          </div>
          <div className={textClassName}>
            {message.message}
            <span>
              {" "}
              { message.senderId == auth.currentUser.uid ? (
                <img className="pt-1" src={`/${message.status}.svg`} height={20} width={20} alt={message.status} />
              ) : ( "") }
            </span>
          </div>
        </li>
      );
    });
  }

  return data === null ? (
    ""
  ) : (
    <div className="chat">
      <div className="chat-header clearfix">
        <div className="row">
          <div className="col-lg-6">
            <a href="#">
              <img src={reciepientAvatarUrl} alt="avatar" />
            </a>
            <div className="chat-about">
              <h6 className="m-b-0">{data?.displayName}</h6>
              <small>{presence}</small>
            </div>
          </div>
        </div>
      </div>
      <div className="chat-history">
        <ul className="m-b-0">
          {renderAllMessages()}
        </ul>
      </div>
      <div className="chat-message clearfix">
        <div className="input-group mb-0">
          <div className="input-group-prepend">
            <span className="input-group-text" onClick={sendMessage} style={{ height: "100%" }} >
            Send 
            <i className="fa fa-paper-plane" style={{ marginLeft: "5px" }} ></i> 
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Enter text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" ? sendMessage(e) : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
