import { SignInButton } from "@clerk/clerk-react";
import "./Login.css";

function Login() {
  return (
    <div className="login">
      <SignInButton className="sign-in-button">
        <span className="sign-in-text">Continue with Google</span>
      </SignInButton>
    </div>
  );
}

export default Login;
