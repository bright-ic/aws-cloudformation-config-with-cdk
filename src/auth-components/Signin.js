import React from "react";
import { Auth } from 'aws-amplify';

class SignIn extends React.Component {
    constructor(props) {
      super(props);
      this.state = {email: '', access_code:"", event_id:props.event_id};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    signUserIn = async ({username, access_code}) => {
      try {
          const user = await Auth.signIn(username,access_code);
          console.log(user);
      } catch (error) {
          console.log('error signin:', error);
      }
  }

  getUserInSession = async () => {
    try {
        const access_detail = await Auth.currentSession();
        const {attributes} = await Auth.currentAuthenticatedUser();
        const user_data = {data: attributes, access: access_detail}
        console.log(user_data);
      } catch (error) {
        console.log('no user insession', error);
    }
  }

  SignOut = async () => {
      try {
          await Auth.signOut();
          console.log("loggedout");
      } catch (error) {
            console.log('error sign out:', error);
      }
    }
  
    handleChange(event) {
        const target = event.target;
        const field = target.name;
        const new_state = {...this.state};
        new_state[field] = target.value;
      this.setState(new_state);
    }
  
    handleSubmit(event) {
      // console.log('A name was submitted: ', this.state);
      event.preventDefault();
      const data = {
        username: this.state.email,
        access_code: this.state.access_code
      }
      console.log(data);
      this.signUserIn(data);
      return false;
    }
  
    render() {
      return (
         <form className="signup_form" onSubmit={this.handleSubmit}>
            {/* <input type="text" name="event_id" value={this.state.event_id} onChange={this.handleChange} placeholder="event id"/> */}
            <input type="text" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email"/>
            <input type="text" name="access_code" value={this.state.access_code} onChange={this.handleChange} placeholder="Access Code"/>
            <button type="submit">Sign In</button>
            <button type="button" style={{marginLeft:"10px"}}
                onClick={this.getUserInSession}>Get User In Session</button>

            <button type="button" style={{marginLeft:"10px"}}
                onClick={this.SignOut}>Logout</button>
        </form>
      );
    }
  }

export default SignIn;