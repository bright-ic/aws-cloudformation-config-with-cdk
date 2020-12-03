
import './App.css';

import SignUpForm from "./auth-components/Signup";
import SignInForm from "./auth-components/Signin";
import ForgotPassword from "./auth-components/ForgotPassword";

const event_id = "1236";
function App() {
  return (
    <div className="App">
      <h2>Signup</h2>
      <SignUpForm event_id={event_id}/>
      <h2>Sign In</h2>
      <SignInForm event_id={event_id}/>
      <h2>Password Recovery</h2>
      <ForgotPassword event_id={event_id}/>
    </div>
  );
}

export default App;
