import React from "react";
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { v4 as uuid } from 'uuid'
console.log((Math.random()).toString(36).slice(2)+ new Date().getTime());
class SignUp extends React.Component {
    constructor(props) {
      super(props);
      this.state = {email: '', access_code:(Math.random()).toString(36).slice(2), event_id:props.event_id, first_name:'', last_name:''};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    signUserUp = async ({username, access_code, email, first_name, last_name ,...data}) => {
        try {
            const {user} = await Auth.signUp({ 
                username,
                password: access_code,
                attributes: {
                    email,
                    'custom:first_name': first_name,
                    'custom:last_name': last_name,
                    'custom:event_app_id': this.state.event_id,
                    'custom:user_type': "attendee"
                }
             });
            console.log("successfully signed up to user pool", user);
        } catch (error) {
            console.log('error signing up:', error);
        }
    }
  
    handleChange(event) {
        const target = event.target;
        const field = target.name;
        const new_state = {...this.state};
        new_state[field] = target.value;
      this.setState(new_state);
    }
  
    async handleSubmit(event) {
        event.preventDefault();
      console.log('submiting...');
      const addUser = `
        mutation addUser($user: UserInput!) {
          addUser(user: $user) {
            success,
            data,
            errors
          }
        }
      `
      const userpool_signup_data = {
          username: this.state.email,
          access_code: this.state.access_code,
          email: this.state.email,
          first_name: this.state.first_name,
          last_name: this.state.last_name
        }
        const id = uuid()

        const user = {
          id,
          email: this.state.email,
          firstName: this.state.first_name,
          lastName: this.state.last_name,
          userType: "attendee",
          registrationStatus: "UNREGISTERED",
          gender: "Male"
        }

        const {data} = await API.graphql(graphqlOperation(addUser, {user: user}));
        let result = data.addUser;
        console.log("successfully sent to dynamodb ",result);
        if(result.success && result.data) {
            console.log("Signing up to user pool");
             this.signUserUp(userpool_signup_data);
        }
      return false;
    }
  
    render() {
      return (
         <form className="signup_form" onSubmit={this.handleSubmit}>
         {/* <input type="text" name="event_id" value={this.state.event_id} onChange={this.handleChange} placeholder="event name"/> */}
         <input type="text" name="access_code" value={this.state.access_code} onChange={this.handleChange} placeholder="access code (8 chars min)"/>
         <input type="text" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email"/>
         <input type="text" name="first_name" value={this.state.first_name} onChange={this.handleChange} placeholder="First name"/>
         <input type="text" name="last_name" value={this.state.last_name} onChange={this.handleChange} placeholder="last name"/>
         <button type="submit">Sign Up</button>
     </form>
      );
    }
  }

export default SignUp;