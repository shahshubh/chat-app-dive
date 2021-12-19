import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.css";
import { auth } from "../Firebase/index";
import { useAuthState } from "react-firebase-hooks/auth";

function MyApp({ Component, pageProps }) {
  // Using a hook to autheticate and store user
  const [user] = useAuthState(auth);

  return <Component user={user} {...pageProps} />;
}

export default MyApp;
