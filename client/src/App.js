import React, { useState } from 'react';
import Identicon from 'react-identicons';
import {
  UncontrolledTooltip
} from 'reactstrap';
import Editor from 'react-medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import Header from "./components/header";
import Login from "./components/login";

const contentDefaultMessage = "Start writing your document here";

const App = () => {
  const [currentUsers, setCurrentUsers] = useState([]);
  const [userActivity] = useState([]);
  const [username, setUserName] = useState();
  const [text, setText] = useState(undefined);

  const logInUser = (loginUserName) => {
    setUserName(loginUserName);
    setCurrentUsers([{
      username: loginUserName,
      randomColor: "aquamarine"
    }]);
  };

  const onEditorStateChange = (editorText) => {
    setText(editorText);
  };

  const showEditorSection = () => (
    <div className="main-content">
      <div className="document-holder">
        <div className="currentusers">
          {currentUsers.map((user) => (
            <>
              <span id={user.username} className="userInfo" key={user.username}>
                <Identicon className="account__avatar" style={{ backgroundColor: user.randomColor }} size={40} string={user.username} />
              </span>
              <UncontrolledTooltip placement="top" target={user.username}>
                {user.username}
              </UncontrolledTooltip>
            </>
          ))}
        </div>
        <Editor
          options={{
            placeholder: {
              text: text ? contentDefaultMessage : ""
            }
          }}
          className="body-editor"
          text={text}
          onChange={onEditorStateChange}
        />
      </div>
      <div className="history-holder">
        <ul>
          {/* eslint-disable-next-line react/no-array-index-key */}
          {userActivity.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container-fluid">
        {username ? showEditorSection() : <Login onLoginFn={logInUser} />}
      </div>
    </>
  );
};

export default App;
