import React from "react";
import { Auth } from 'aws-amplify';

class ForgotPassword extends React.Component {
    constructor(props) {
      super(props);
      this.state = {email: '', new_password:"", code:"", event_id: props.event_id, show_new_password_form:false, msg:""};
  
      this.handleChange = this.handleChange.bind(this);
    }

    sendPasswordRecoveryEmail = async (e) => {
        e.preventDefault();
        if(this.state.email === "") alert ("invalid email address");
        else {
            try {
                const username = this.state.event_id+":"+this.state.email;
                console.log(username);
                // Send confirmation code to user's email
                const data = await Auth.forgotPassword(username);
                this.setState({...this.state, show_new_password_form: true, msg: "A code has been sent to you"});
                console.log(data);
            } catch (error) {
                console.log('Failed to send password recovery code', error);
                this.setState({...this.state, msg: "Failed to send password recovery code"});
            }
        }
    }

    recoverPasswordSubmit = async (e) => {
        e.preventDefault();
        if(this.state.code === "") alert ("Recovery code is required");
        else if(this.state.new_password === "") alert("new password filed is required");
        else {
            try{
                const username = this.state.event_id+":"+this.state.email;
                const code = this.state.code;
                const new_password = this.state.new_password;
                const data = await Auth.forgotPasswordSubmit(username, code, new_password);
                this.setState({...this.state, show_new_password_form: false});
                console.log(data);
            } catch (error) {
                console.log('Failed update password', error);
                this.setState({...this.state, msg: "Failed to recover password"});

            }
        }
    }
  
    handleChange(event) {
        const target = event.target;
        const field = target.name;
        const new_state = {...this.state};
        new_state[field] = target.value;
      this.setState(new_state);
    }
  
    render() {
        if(this.state.show_new_password_form) {
            return (<form className="signup_form" onSubmit={this.recoverPasswordSubmit}>
                <input type="text" name="code" value={this.state.code} onChange={this.handleChange} placeholder="Code"/>
                <input type="text" name="new_password" value={this.state.new_password} onChange={this.handleChange} placeholder="New password"/>
                <button type="submit">Set New Password</button>
            </form>);
        }

        return (
            <div>
                <h6>Enter Email Address</h6>
                <form className="signup_form" onSubmit={this.sendPasswordRecoveryEmail}>
                    <input type="text" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email"/>
                    <button type="submit">Send Code</button>
                </form>
            </div>
        );
    }
  }

export default ForgotPassword;