import React from 'react';
import Identicon from "react-identicons";

const Login = ({ onLoginFn }) => {
  const userNameInput = React.createRef();

  const onLogin = () => {
    const username = userNameInput.current.value.trim();
    onLoginFn(username);
  };

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="account__profile">
            <Identicon className="account__avatar" size={64} string="randomness" />
            <p className="account__name">Hello, user!</p>
            <p className="account__sub">Join to edit the document</p>
          </div>
          <input name="username" ref={userNameInput} className="form-control" />
          <button type="button" onClick={() => onLogin()} className="btn btn-primary account__btn">Join</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
