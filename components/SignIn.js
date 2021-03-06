import { firebase, auth } from "../Firebase/index";
import userSave from "../utils/userSave";


const SignIn = () => {
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    userSave();
  };

  return (
    <div className="app-signin-container" >
      <div className="app-header" >
        <h1>
          <span>
            <img src="https://externship.github.in/orglogo/dive.jpeg" alt="Dive" width="50" height="50" />
          </span> 
          Welcome, to the Chat App!
        </h1>
        <p>
          Github Externship Assignment 
        </p>
      </div>
      <div
        style={{display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",textAlign: "center",minHeight: "90vh"}}
      >
        <div className="row" style={{ width: "100%", justifyContent: "center" }} >
          <div className="col-md-3">
            <button className="btn btn-lg btn-light" onClick={signInWithGoogle} role="button" style={{ textTransform: "none" }}>
              <img width="20px" style={{ marginBottom: "3px", marginRight: "5px" }} alt="Google sign-in" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
              Login with Google
            </button>
          </div>
        </div>
        <div className="app-footer" >
          Made with ❤ by <a href="https://github.com/shahshubh">Shubh</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
