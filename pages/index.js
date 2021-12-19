import { useEffect, useState } from "react";
import { auth } from "../Firebase/index";
import SignIn from "../components/SignIn";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import changeStatus from "../utils/changeStatus";

const Home = ({ user = {} }) => {
  const [info, setInfo] = useState(null);
  const [room, setRoom] = useState(null);

  // Setting up room information to render a chat between two users
  const handler = (obj) => {
    if (obj?.uid != undefined && auth.currentUser?.uid != undefined) {
      if (obj?.uid < auth.currentUser?.uid)
        setRoom(obj?.uid + auth.currentUser?.uid);
      else setRoom(auth.currentUser?.uid + obj?.uid);
    }
    setInfo(obj);
  };

  useEffect(() => {
    changeStatus();
  });
  return (
    <div>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossOrigin="anonymous"></link>
      <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      {user ? (
        <div className="container">
        <div className="row clearfix">
            <div className="col-lg-12">
                <div className="card chat-app">
                    <Sidebar user={user} handler={handler} />
                    <Chat data={info} room={room} />
                </div>
            </div>
        </div>
        </div>
      ) : (
        <SignIn />
      )}
    </div>
  );
};

export default Home;
